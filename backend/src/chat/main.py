from typing_extensions import TypedDict
from typing import Annotated
from langgraph.graph.message import add_messages
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END
from dotenv import load_dotenv
import os

load_dotenv()

os.environ["GOOGLE_API_KEY"]= os.getenv("GEMINI_API_KEY")
llm = init_chat_model("google_genai:gemini-2.0-flash")
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

def get_ai_response(user_input: str):

    response = graph.invoke({"messages": [{"role": "user", "content": user_input}]})
    ai_message= response["messages"][-1].content
    # print(ai_message)
    return ai_message
