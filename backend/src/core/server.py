from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import AsyncMongoClient
from src.chat.routers.chat_router import router as chat_router
from src.notes.routers.note_router import router as notes_router
from src.notes.routers.blog_router import router as blog_router
from src.notes.dal.note_dal import NoteDAL
from src.notes.dal.blog_dal import BlogDAL
from src.notes.dal.service import CollectionService
from src.chat.dal import ChatBot

from dotenv import load_dotenv
import os

load_dotenv()

# imports from env
CHAT_COLLECTION = os.getenv("CHAT_COLLECTION")
BLOG_COLLECTION = os.getenv("BLOG_COLLECTION")
NOTE_COLLECTION = os.getenv("NOTE_COLLECTION")
MONGODB_URI = os.getenv("MONGODB_URI")
DB = os.getenv("DB_NAME")
DEBUG = os.getenv("DEBUG")

collections = [CHAT_COLLECTION,BLOG_COLLECTION,NOTE_COLLECTION]
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        client = AsyncMongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        db = client[DB]

        existing_collections = await db.list_collection_names()
        for collection in collections:
            if collection not in existing_collections:
                await db.create_collection(collection)

        chatbot_col = db[CHAT_COLLECTION]
        blog_col = db[BLOG_COLLECTION]
        note_col = db[NOTE_COLLECTION]

        chatbot_dal = ChatBot(chatbot_col)
        blog_dal = BlogDAL(blog_col)
        note_dal = NoteDAL(note_col)

        collection_service = CollectionService(
            blog_dal=blog_dal,
            note_dal=note_dal,
            client=client
        )

        app.state.chatbot_dal = chatbot_dal
        app.state.blog_dal = blog_dal
        app.state.note_dal = note_dal
        app.state.collection_service = collection_service

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

app.include_router(chat_router)
app.include_router(notes_router)
app.include_router(blog_router)
