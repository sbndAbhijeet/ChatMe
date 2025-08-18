from typing_extensions import TypedDict
from typing import Annotated
from langgraph.graph.message import add_messages
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.mongodb import MongoDBSaver
from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv()

os.environ["GOOGLE_API_KEY"]= os.getenv("GEMINI_API_KEY")
DB_URI = os.getenv("MONOGB_URI")
llm = init_chat_model("google_genai:gemini-2.0-flash")

COLLECTION_NAME = "luminchat_checkpointer"
MAX_MESSAGES = 50

client = OpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

class State(TypedDict):
    messages: Annotated[list, add_messages]

# Bot Response
def chatbot(state: State):
    result = llm.invoke(state["messages"])
    return {"messages": [result]}

# Title Generation
async def generate_title(user: str):
    SYSTEM_PROMPT = """
    You are a Title Generator. Never answer to the user query.
    Steps to be followed:
    1. Generate 3 to 4 words of short title based on the user input message.
    2. The title should summarize the message and don't use bad words (even if required).
    3. Make sure to respond in Good Context, even if bad words are present.
    Examples:
    User: Hey one person calling my family members too many times for 2 days even on lifting not responding.
    Response: Nuisance call advice

    User: Hey nowadays you/ai is taking task of many it/tech jobs 😔 so in this era what are the other options or field I can go for in tech field and jobs
    Response: Tech job options 2023

    User: How can a house keeping woman with a some health issue can even make some side hustle at home of money easy and less time any ideas also she less aware of technology 
    Response: Side Hustle Ideas at Home
    """

    response = client.chat.completions.create(
        model="gemini-2.0-flash",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user}
        ]
    )
    print("inside generate title")
    print(response.choices[0].message.content)

    return response.choices[0].message.content

# Graph Building
graph_builder = StateGraph(State)
graph_builder.add_node("chatbot", chatbot)

graph_builder.add_edge(START, "chatbot")
graph_builder.add_edge("chatbot", END)

graph = graph_builder.compile()

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
def get_ai_response(user_input: str, doc_id: str):
    config = {"configurable": {"thread_id": doc_id}}

    with MongoDBSaver.from_conn_string(DB_URI, "LuminAI_db", COLLECTION_NAME) as saver:
        checkpoint = saver.get(config)
        if checkpoint is None:
            "New Chat Started"
            

        print("Thread ID:", doc_id)
        graph_with_cp = create_checkpointer(saver)
        response = graph_with_cp.invoke({"messages": [{"role": "user", "content": user_input}]}, config)

        checkpointer_window(saver, config)
        
        ai_message= response["messages"][-1].content
    # print(ai_message)
    return ai_message


# Testing
if __name__ == "__main__":
    user_message = """You are Tonny Robbins and motivate me in dsa and how to improve coding skills. in his way assume i am very bad at dsa even though i am ok at basic, i am unable to make solution, also you know i talked about my coding problem solving problem with you many times keep that in mind and tell me solution"""
    generate_title(user_message)