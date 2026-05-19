import os
from pathlib import Path
from typing import List
import hashlib
import uuid

from dotenv import load_dotenv

load_dotenv()

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings

from qdrant_client import models

from .qdrant_client import upsert_points, ensure_collection

CHUNK_SIZE = 900
CHUNK_OVERLAP = 150
EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")


def sha256_of_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def process_pdf_and_upsert(qdrant_client, collection_name: str, file_path: Path, document_id: str, user_id: str, pdf_hash: str):
    # load
    loader = PyPDFLoader(str(file_path))
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    chunks = splitter.split_documents(docs)

    embedder = OpenAIEmbeddings(
        model=EMBEDDING_MODEL,
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )
    texts = [c.page_content for c in chunks]
    vectors = embedder.embed_documents(texts)

    # ensure collection with correct vector size
    if vectors:
        ensure_collection(qdrant_client, collection_name, vector_size=len(vectors[0]))

    points = []
    for idx, (chunk, vector) in enumerate(zip(chunks, vectors)):
        chunk_index = idx
        # Qdrant local mode requires point IDs to be valid UUIDs or integers.
        # Use a deterministic UUID so retries/upserts keep stable IDs per chunk.
        point_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"{document_id}:{chunk_index}"))
        payload = {
            "document_id": document_id,
            "user_id": user_id,
            "pdf_hash": pdf_hash,
            "filename": file_path.name,
            "chunk_index": chunk_index,
            "text": chunk.page_content[:2000]
        }
        points.append(models.PointStruct(id=point_id, vector=vector, payload=payload))

    if points:
        upsert_points(qdrant_client, collection_name, points)

    return len(points)
