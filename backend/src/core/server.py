from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import AsyncMongoClient

from ..auth.router import router as auth_router
from ..users.routes.user import router as user_router
from ..chat.routers.chat_router import router as chat_router
from ..notes.routers.note_router import router as notes_router
from ..notes.routers.blog_router import router as blog_router


from ..notes.dal.note_dal import NoteDAL
from ..users.dal.user import UserDAL
from ..notes.dal.blog_dal import BlogDAL
from ..notes.dal.service import CollectionService
from ..chat.dal import ChatBot
from ..rag.dal import DocumentDAL, QdrantDAL
from ..rag.qdrant_client import init_qdrant
from ..rag.router import router as rag_router

from dotenv import load_dotenv
import os

load_dotenv()

# imports from env
CHAT_DB = os.getenv("CHAT_DB")
BLOG_DB = os.getenv("BLOG_DB")
NOTE_DB = os.getenv("NOTE_DB")
USER_DB = os.getenv("USER_DB")
DOC_DB = os.getenv("DOCUMENTS_DB")

MONGODB_URI = os.getenv("MONGODB_URI")
DB = os.getenv("DB_NAME")
DEBUG = os.getenv("DEBUG")
QDRANT_PATH = os.getenv("QDRANT_PATH")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "documents_collection")
FRONTEND_ORIGINS = [origin.strip() for origin in os.getenv("FRONTEND_ORIGINS", "").split(",") if origin.strip()]

required_settings = {
    "MONGODB_URI": MONGODB_URI,
    "DB_NAME": DB,
    "CHAT_DB": CHAT_DB,
    "BLOG_DB": BLOG_DB,
    "NOTE_DB": NOTE_DB,
    "USER_DB": USER_DB,
    "DOCUMENTS_DB": DOC_DB,
}
missing_settings = [name for name, value in required_settings.items() if not value]
if missing_settings:
    raise RuntimeError(f"Missing backend configuration: {', '.join(missing_settings)}")
if DEBUG is None or DEBUG.lower() not in ("true", "1"):
    if not (QDRANT_URL or QDRANT_PATH):
        raise RuntimeError("Production requires QDRANT_URL or a QDRANT_PATH on a persistent volume")

collections = [CHAT_DB, BLOG_DB, NOTE_DB, USER_DB, DOC_DB]

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

        chatbot_col = db[CHAT_DB]
        blog_col = db[BLOG_DB]
        note_col = db[NOTE_DB]
        user_col = db[USER_DB]
        doc_col = db[DOC_DB]

        # The index enforces uniqueness even for concurrent registrations.
        await user_col.create_index("email", unique=True, name="unique_user_email")

        await chatbot_col.create_index(
            [
                ("user_id", 1),
                ("updated_at", -1),
            ],
            name="user_updated_at_idx",
            background=True,
        )

        chatbot_dal = ChatBot(chatbot_col)
        blog_dal = BlogDAL(blog_col)
        note_dal = NoteDAL(note_col)
        user_dal = UserDAL(user_col)
        doc_dal = DocumentDAL(doc_col)

        # initialize qdrant client (local or remote)
        q_client = init_qdrant(path=QDRANT_PATH, url=QDRANT_URL, api_key=QDRANT_API_KEY)
        qdrant_dal = QdrantDAL(q_client, QDRANT_COLLECTION)
        # The first PDF upload creates the collection using its embedding dimension.

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
        app.state.document_dal = doc_dal
        app.state.qdrant_dal = qdrant_dal

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
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        *FRONTEND_ORIGINS,
    ],
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
