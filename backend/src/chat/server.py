from fastapi import FastAPI, HTTPException, status, WebSocket
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from bson import ObjectId
from pydantic import BaseModel

from .main import get_ai_response, generate_title
import uvicorn

from dotenv import load_dotenv
from .dal import ChatBot, HistorySummary
import os
load_dotenv()

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

COLLECTION_NAME = os.getenv("COLLECTION_NAME")
MONGODB_URI = os.getenv("MONGODB_URI")
db_name = os.getenv("DB_NAME")
DEBUG = os.getenv("DEBUG")

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS = 5000)
        database = client[db_name]

        #create collection if it doesn't exist
        if COLLECTION_NAME not in await database.list_collection_names():
            await database.create_collection(COLLECTION_NAME)

        lumin_chatbot = database.get_collection(COLLECTION_NAME)
        app.chatbot_dal = ChatBot(lumin_chatbot)
        yield

    except Exception as e:
        print(f"Failed to connect to Mongodb: {e}")
        raise
    finally:
        client.close()


app = FastAPI(lifespan=lifespan)

app.add_middleware( 
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # React app origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class MessageInput(BaseModel):
    message: str
    tools: list

class MessageOutput(BaseModel):
    reply: str

class RenameRequest(BaseModel):
    title: str

@app.get("/")
def read_root():
    return {"Hello": "World"}

# chatHistory data getting
@app.get("/api/chat_history")
async def get_chatbot_history() -> list[HistorySummary]:
    return [i async for i in app.chatbot_dal.get_chat_history()]

class ChatModel(BaseModel):
    id: str
    messages: list

@app.get("/api/chat_session/{doc_id}")
async def get_current_chat(doc_id: str):
    chat = await app.chatbot_dal.get_current_chat(doc_id)
    return {"id": str(chat["_id"]), "messages": chat["messages"]}

@app.post("/api/chatbot/lists/{chat_id}", status_code=status.HTTP_201_CREATED)
async def create_new_chat(chat_id: int):
    return {
        "id": await app.chatbot_dal.create_new_chat(chat_id),
        "title": f"New Chat - {chat_id}"
    }


@app.post("/api/save_response/{id}" , response_model=MessageOutput)
async def process_save_responses(id: str, user_input: MessageInput):
    # print(f"Received request: id={id}, message={user_input.message}")
    try:
        object_id = ObjectId(id)  # Convert string to ObjectId
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
    is_new = await app.chatbot_dal.is_new_thread(object_id)

    result = get_ai_response(user_input.message, id, user_input.tools)
    await app.chatbot_dal.save_sender_response(object_id, "user", user_input.message)
    await app.chatbot_dal.save_sender_response(object_id, "bot", result)

    # Rewriting Title for new Chats
    # print(is_new)
    if is_new:
        new_title = await generate_title(user_input.message)
        print("new title: ",new_title)
        await app.chatbot_dal.rename_chat_title(id, new_title)
        
    return {"reply": result}

@app.delete("/api/delete_chat/{doc_id}")
async def delete_chat(doc_id: str) -> bool:
    return await app.chatbot_dal.delete_chat(doc_id)

@app.patch("/api/chat_rename/{doc_id}")
async def rename_chat_title(doc_id: str, request: RenameRequest):
    return await app.chatbot_dal.rename_chat_title(doc_id, request.title)
