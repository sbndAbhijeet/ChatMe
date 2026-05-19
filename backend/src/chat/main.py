from typing import Annotated, Literal, TypedDict
from langgraph.graph.message import add_messages
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.mongodb import MongoDBSaver
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from openai import OpenAI
from src.web_search.search import clean_web_context
import os
from functools import lru_cache
from src.rag.service import build_pdf_context


load_dotenv()

GRAPH_VERSION = "v1"   # change to v2, v3, v4 whenever your graph changes


def _resolve_api_key(api_key: str | None = None):
    return api_key or os.getenv("OPENROUTER_API_KEY")


@lru_cache(maxsize=20)
def get_llm(model_id, api_key=None):
    print("Model ID: ", model_id)
    return ChatOpenAI(
        model=model_id,
        api_key=_resolve_api_key(api_key),
        base_url="https://openrouter.ai/api/v1",
        max_retries=2,
        timeout=30,
    )

DB_URI = os.getenv("MONOGB_URI")
# llm = get_llm(config.GLOBAL_MODEL)

COLLECTION_NAME = "luminchat_checkpointer"
MAX_MESSAGES = 50

def get_openai_client(api_key: str | None = None):
    return OpenAI(
        api_key=_resolve_api_key(api_key),
        base_url="https://openrouter.ai/api/v1"
    )

class State(TypedDict):
    messages: Annotated[list, add_messages] #stores conversation history 
    tools_queue: list[int] 
    tool_results: list[dict]
    selected_document_ids: list[str]

def _last_user_message(state: State) -> str:
    """
    Helper to get last user message from state.messages.
    Handles both dict and AIMessage/HumanMessage types.
    """
    for msg in reversed(state.get("messages",[])):
        if isinstance(msg, dict):
            if msg.get("role") == "user":
                return msg.get("content", "")
        else: #assuming langchain message obj
            if msg.type == "human":
                return msg.content
    return ""

# tool id: 1
def web_tool(state: State):
    """
    Processes ONE tool from the queue.
    - Peeks at first tool_id.
    - If 1, runs web search, appends result as {"role": "system", "content": "..."}
    - Pops the tool_id AFTER processing.
    - Returns updated state.
    """
    # ensuring list exist
    state.setdefault("tools_queue",[])
    state.setdefault("tool_results", [])

    # if no tool
    if not state.get("tools_queue"):
        return state
    
    # pop the first tool id
    tool_id = state["tools_queue"][0]
    new_tool_results = state.get("tool_results",[]).copy()

    # handling web tools
    if tool_id == 1:
        query = _last_user_message(state)
        try:
            web_data = clean_web_context(query)
            print(f'Web data: {web_data}')
            new_tool_results.append({
                "role": "system",
                "content": f"Web search result:\n{web_data}"
            })
        except Exception as e:
            print(str(e))

    # pop the process tool_id
    new_queue = state["tools_queue"][1:]

    return {
        "tools_queue": new_queue,
        "tool_results": new_tool_results
    }


# tool id: 2
def pdf_tool(state: State, config):
    """
    Processes ONE PDF/RAG tool from the queue.
    - If 2, retrieves only from the selected PDF document ids.
    - Appends result as a system message.
    - Pops the tool_id AFTER processing.
    - Returns updated state.
    """
    state.setdefault("tools_queue", [])
    state.setdefault("tool_results", [])
    state.setdefault("selected_document_ids", [])

    if not state.get("tools_queue"):
        return state

    tool_id = state["tools_queue"][0]
    new_tool_results = state.get("tool_results", []).copy()

    if tool_id == 2:
        query = _last_user_message(state)
        selected_document_ids = state.get("selected_document_ids", [])
        try:
            context = build_pdf_context(
                query,
                selected_document_ids=selected_document_ids,
                qdrant_client=config["configurable"].get("qdrant_client"),
                qdrant_collection=config["configurable"].get("qdrant_collection"),
                api_key=config["configurable"].get("api_key"),
                top_k=5,
            )
            if context:
                new_tool_results.append({
                    "role": "system",
                    "content": context,
                })
        except Exception as e:
            print("PDF retrieval failed:", e)

    new_queue = state["tools_queue"][1:]

    return {
        "tools_queue": new_queue,
        "tool_results": new_tool_results,
        "selected_document_ids": state.get("selected_document_ids", []),
    }




# Decider (conditional edge)
def route_tools(state: State) -> Literal['web_tool', 'pdf_tool', 'chatbot']:
    state.setdefault("tools_queue", [])
    print(state["tools_queue"])
    if state['tools_queue']:
        # peek the next tool
        # just check don't manipulate tools_queue before
        next_tool = state["tools_queue"][0]
        if next_tool == 1:
            return 'web_tool'
        if next_tool == 2:
            return 'pdf_tool'
        # add other tools here

    # if no tools in queue
    return 'chatbot'

# Bot Response
def chatbot(state: State, config):
    """
    Invokes LLM with: messages + tool_results
    Appends AI response to messages.
    Clears tool_results after use.
    """
    model_id = config["configurable"]['model']
    api_key = config["configurable"].get("api_key")
    llm = get_llm(model_id, api_key) # every time reinitialized (demerit)
    full_input = state['messages'] + state.get('tool_results',[])
    result = llm.invoke(full_input)
    return {
        "messages": [result],
        "tool_results": [] #clear
    }

# Title Generation
async def generate_title(user: str, api_key: str | None = None):
    SYSTEM_PROMPT = """
    You are a Title Generator. Never answer to the user query.
    Steps to be followed:
    1. Generate 3 to 4 words of short title based on the user input message.
    2. The title should summarize the message and don't use bad words (even if required).
    3. Make sure to respond in Good Context, even if bad words are present.
    4. If anyone asks who are you answer "About my self"
    Examples:
    User: Hey one person calling my family members too many times for 2 days even on lifting not responding.
    Response: Nuisance call advice

    User: Hey nowadays you/ai is taking task of many it/tech jobs 😔 so in this era what are the other options or field I can go for in tech field and jobs
    Response: Tech job options 2023

    User: How can a house keeping woman with a some health issue can even make some side hustle at home of money easy and less time any ideas also she less aware of technology 
    Response: Side Hustle Ideas at Home
    """

    client = get_openai_client(api_key)
    response = client.chat.completions.create(
        model="openai/gpt-oss-20b:free",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user}
        ]
    )
    print("inside generate title")
    # print(response.choices[0].message.content)

    return response.choices[0].message.content

# Add the router as a real (empty) node
def route_tools_node(state: State):
    return state  # does nothing, just passes through
# Graph Building
graph_builder = StateGraph(State)
# builind nodes
graph_builder.add_node('web_tool', web_tool)
graph_builder.add_node('pdf_tool', pdf_tool)
graph_builder.add_node("chatbot", chatbot) # final llm node
graph_builder.add_node("route_tools", route_tools_node)

graph_builder.add_edge(START, "route_tools")

graph_builder.add_conditional_edges(
    "route_tools",
    route_tools,
    {"web_tool": "web_tool", "pdf_tool": "pdf_tool", "chatbot": "chatbot"}
)

graph_builder.add_edge("web_tool", "route_tools")  # loop back
graph_builder.add_edge("pdf_tool", "route_tools")  # loop back
graph_builder.add_edge("chatbot", END)


# Graph Compilation
def create_checkpointer(checkpointer):
    return graph_builder.compile(checkpointer=checkpointer)

# Checkpointer Window
def checkpointer_window(saver, config):
    """ Keeps only the last MAX_MESSAGES user messages per thread. """
    state = saver.get(config)
    if state and "messages" in state:
        state["messages"] = state["messages"][-MAX_MESSAGES:]
        saver.save_checkpoint(config, state)


# async def get_ai_response(user_input: str, doc_id: str):
#     return await asyncio.to_thread(_get_ai_response_sync, user_input, doc_id)

# AI Response
async def get_ai_response(user_input: str, doc_id: str, tools: list[str], model: str, api_key: str | None = None, selected_document_ids: list | None = None, qdrant_client=None, qdrant_collection: str | None = None):
    config = {
        "configurable": {
            "thread_id": doc_id,
            "graph_version": GRAPH_VERSION,
            "model": model,
            "api_key": api_key,
            "qdrant_client": qdrant_client,
            "qdrant_collection": qdrant_collection,
        }
    }

    with MongoDBSaver.from_conn_string(DB_URI, "LuminAI_db", COLLECTION_NAME) as saver:
        checkpoint = saver.get(config)
        if checkpoint is None:
            "New Chat Started"
            

        print("Thread ID:", doc_id)
        graph_with_cp = create_checkpointer(saver)

        input_state = {
            "messages": [{
                "role": "user",
                "content": user_input
            }],
            "tools_queue": tools.copy(),
            "tool_results": [],
            "selected_document_ids": selected_document_ids or [],
        }
        response = graph_with_cp.invoke(input_state, config)

        checkpointer_window(saver, config)
        
        ai_message= response["messages"][-1].content
    # print(ai_message)
    return ai_message


# Testing
if __name__ == "__main__":
    user_message = """You are Tonny Robbins and motivate me in dsa and how to improve coding skills. in his way assume i am very bad at dsa even though i am ok at basic, i am unable to make solution, also you know i talked about my coding problem solving problem with you many times keep that in mind and tell me solution"""
    generate_title(user_message)