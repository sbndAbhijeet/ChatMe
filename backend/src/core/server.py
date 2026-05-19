from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import AsyncMongoClient

from src.auth.router import router as auth_router
from src.users.routes.user import router as user_router
from src.chat.routers.chat_router import router as chat_router
from src.notes.routers.note_router import router as notes_router
from src.notes.routers.blog_router import router as blog_router


from src.notes.dal.note_dal import NoteDAL
from src.users.dal.user import UserDAL
from src.notes.dal.blog_dal import BlogDAL
from src.notes.dal.service import CollectionService
from src.chat.dal import ChatBot
from src.rag.dal import DocumentDAL
from src.rag.qdrant_client import init_qdrant, ensure_collection
from src.rag.router import router as rag_router

from dotenv import load_dotenv
import os

load_dotenv()

# imports from env
CHAT_COLLECTION = os.getenv("CHAT_COLLECTION")
BLOG_COLLECTION = os.getenv("BLOG_COLLECTION")
NOTE_COLLECTION = os.getenv("NOTE_COLLECTION")
USER_COLLECTION = os.getenv("USER_COLLECTION")

MONGODB_URI = os.getenv("MONGODB_URI")
DB = os.getenv("DB_NAME")
DEBUG = os.getenv("DEBUG")
QDRANT_PATH = os.getenv("QDRANT_PATH")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "documents_collection")

collections = [CHAT_COLLECTION,BLOG_COLLECTION,NOTE_COLLECTION, USER_COLLECTION]
@asynccontextmanager
async def lifespan(app: FastAPI):
    client = None
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
        user_col = db[USER_COLLECTION]

        chatbot_dal = ChatBot(chatbot_col)
        blog_dal = BlogDAL(blog_col)
        note_dal = NoteDAL(note_col)
        user_dal = UserDAL(user_col)
        # documents collection for uploaded PDFs
        documents_collection_name = os.getenv("DOCUMENTS_COLLECTION", "documents")
        if documents_collection_name not in existing_collections:
            await db.create_collection(documents_collection_name)

        documents_col = db[documents_collection_name]
        document_dal = DocumentDAL(documents_col)

        # initialize qdrant client (local or remote)
        q_client = init_qdrant(path=QDRANT_PATH, url=QDRANT_URL, api_key=QDRANT_API_KEY)
        # ensure collection exists
        try:
            ensure_collection(q_client, QDRANT_COLLECTION)
        except Exception:
            # best-effort, will be recreated during first upsert
            pass

        collection_service = CollectionService(
            blog_dal=blog_dal,
            note_dal=note_dal,
            client=client
        )

        app.state.chatbot_dal = chatbot_dal
        app.state.blog_dal = blog_dal
        app.state.note_dal = note_dal
        app.state.user_dal = user_dal
        app.state.collection_service = collection_service
        app.state.document_dal = document_dal
        app.state.qdrant_client = q_client
        app.state.qdrant_collection = QDRANT_COLLECTION

        yield

    except Exception as e:
        print(f"Failed to connect to Mongodb: {e}")
        raise
    finally:
        if client is not None:
            await client.close()
    

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000"], # React app origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(chat_router)
app.include_router(notes_router)
app.include_router(blog_router)
app.include_router(rag_router)
app.include_router(auth_router, prefix="/api")
app.include_router(user_router)