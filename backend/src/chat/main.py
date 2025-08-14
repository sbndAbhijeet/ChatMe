from typing_extensions import TypedDict
from typing import Annotated
from langgraph.graph.message import add_messages
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.mongodb import MongoDBSaver
from dotenv import load_dotenv
import os

load_dotenv()

os.environ["GOOGLE_API_KEY"]= os.getenv("GEMINI_API_KEY")
DB_URI = os.getenv("MONOGB_URI")
llm = init_chat_model("google_genai:gemini-2.0-flash")

COLLECTION_NAME = "luminchat_checkpointer"
MAX_MESSAGES = 50
class State(TypedDict):
    messages: Annotated[list, add_messages]

def chatbot(state: State):
    from typing_extensions import TypedDict
from typing import Annotated
from langgraph.graph.message import add_messages
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.mongodb import MongoDBSaver
from dotenv import load_dotenv
import os

load_dotenv()

os.environ["GOOGLE_API_KEY"]= os.getenv("GEMINI_API_KEY")
DB_URI = os.getenv("MONOGB_URI")
llm = init_chat_model("google_genai:gemini-2.0-flash")

COLLECTION_NAME = "luminchat_checkpointer"
MAX_MESSAGES = 2
class State(TypedDict):
    messages: Annotated[list, add_messages]

def chatbot(state: State):
    result = llm.invoke(state["messages"])
    return {"messages": [result]}

graph_builder = StateGraph(State)
graph_builder.add_node("chatbot", chatbot)

graph_builder.add_edge(START, "chatbot")
graph_builder.add_edge("chatbot", END)

graph = graph_builder.compile()

def create_checkpointer(checkpointer):
    return graph_builder.compile(checkpointer=checkpointer)


def checkpointer_window(saver, thread_id):
    """ Keeps only the last MAX_MESSAGES user messages per thread. """
    state = saver.load_checkpointer(thread_id)
    if state and "messages" in state:
        state["messages"] = state["messages"][-MAX_MESSAGES:]
        saver.save_checkpoint(thread_id, state)

def get_ai_response(user_input: str, doc_id: str):
    config = {"configurable": {"thread_id": doc_id}}

    with MongoDBSaver.from_conn_string(DB_URI, "LuminAI_db", COLLECTION_NAME) as saver:
        print("Thread ID:", doc_id)
        graph_with_cp = create_checkpointer(saver)
        response = graph_with_cp.invoke({"messages": [{"role": "user", "content": user_input}]}, config)

        checkpointer_window(saver, thread_id=doc_id)
        
        ai_message= response["messages"][-1].content
    # print(ai_message)
    return ai_message


graph_builder = StateGraph(State)
graph_builder.add_node("chatbot", chatbot)

graph_builder.add_edge(START, "chatbot")
graph_builder.add_edge("chatbot", END)

graph = graph_builder.compile()

def create_checkpointer(checkpointer):
    return graph_builder.compile(checkpointer=checkpointer)


def checkpointer_window(saver, thread_id):
    """ Keeps only the last MAX_MESSAGES user messages per thread. """
    state = saver.load_checkpointer(thread_id)
    if state and "messages" in state:
        state["messages"] = state["messages"][-MAX_MESSAGES]
        saver.save_checkpoint(thread_id, state)

def get_ai_response(user_input: str, doc_id: str):
    config = {"configurable": {"thread_id": doc_id}}

    with MongoDBSaver.from_conn_string(DB_URI, "LuminAI_db", COLLECTION_NAME) as saver:
        print("Thread ID:", doc_id)
        graph_with_cp = create_checkpointer(saver)
        response = graph_with_cp.invoke({"messages": [{"role": "user", "content": user_input}]}, config)
        ai_message= response["messages"][-1].content
    # print(ai_message)
    return ai_message
