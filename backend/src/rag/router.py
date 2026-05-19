from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from pathlib import Path
import asyncio
import os
import uuid
from datetime import datetime

from src.auth.dependencies import get_current_user
from .dal import DocumentDAL
from .processor import process_pdf_and_upsert, sha256_of_file
from .qdrant_client import delete_points_by_filter
from qdrant_client import models

router = APIRouter(prefix="/api/rag", tags=["rag"])

STORAGE_DIR = Path(__file__).resolve().parents[2] / "storage" / "pdfs"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")


@router.post("/upload")
async def upload_pdf(
    request: Request,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    app = request.app
    doc_dal: DocumentDAL = app.state.document_dal
    qdrant_client = app.state.qdrant_client
    collection_name = app.state.qdrant_collection

    # save file temporarily
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    out_path = STORAGE_DIR / filename
    content = await file.read()
    out_path.write_bytes(content)

    pdf_hash = sha256_of_file(out_path)
    existing = await doc_dal.get_by_hash(pdf_hash, user_id=user_id)
    if existing:
        # cleanup saved duplicate
        out_path.unlink(missing_ok=True)
        return JSONResponse({"status": "exists", "document": existing})

    metadata = {
        "user_id": user_id,
        "filename": file.filename,
        "stored_filename": filename,
        "pdf_hash": pdf_hash,
        "uploaded_at": datetime.utcnow(),
    }

    doc = await doc_dal.create_document(metadata)

    # process and embed synchronously using thread to avoid blocking event loop
    def _proc():
        return process_pdf_and_upsert(qdrant_client, collection_name, out_path, str(doc["_id"]), user_id or "", pdf_hash)

    inserted_chunks = await asyncio.to_thread(_proc)

    return {"status": "ok", "document": doc, "chunks_indexed": inserted_chunks}


@router.get("/documents")
async def list_documents(
    request: Request,
    user_id: str = Depends(get_current_user),
):
    app = request.app
    doc_dal: DocumentDAL = app.state.document_dal
    docs = await doc_dal.list_documents(user_id=user_id)
    return {"documents": docs}


@router.delete("/documents/{document_id}")
async def delete_document(
    request: Request,
    document_id: str,
    user_id: str = Depends(get_current_user),
):
    app = request.app
    doc_dal: DocumentDAL = app.state.document_dal
    qdrant_client = app.state.qdrant_client
    collection_name = app.state.qdrant_collection

    doc = await doc_dal.get_document(document_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    if doc.get("user_id") != user_id:
        raise HTTPException(403, "Not allowed to delete this document")

    # delete vectors (blocking qdrant call)
    def _del():
        flt = models.Filter(
            must=[
                models.FieldCondition(key="user_id", match=models.MatchValue(value=user_id)),
                models.FieldCondition(key="document_id", match=models.MatchValue(value=document_id)),
            ]
        )
        delete_points_by_filter(qdrant_client, collection_name, flt)

    await asyncio.to_thread(_del)

    # delete metadata
    deleted = await doc_dal.delete_document(document_id)
    # delete stored file
    stored = Path(__file__).resolve().parents[2] / "storage" / "pdfs" / doc.get("stored_filename", "")
    if stored.exists():
        stored.unlink(missing_ok=True)

    return {"deleted": deleted}


@router.post("/query")
async def query_documents(
    request: Request,
    payload: dict,
    user_id: str = Depends(get_current_user),
):
    """payload = {"query": str, "selected_document_ids": [ids], "top_k": int}
    """
    app = request.app
    qdrant_client = app.state.qdrant_client
    collection_name = app.state.qdrant_collection
    query = payload.get("query")
    selected = payload.get("selected_document_ids")
    top_k = int(payload.get("top_k", 5))
    if not query:
        raise HTTPException(400, "query required")

    # embed query in thread
    from langchain.embeddings import OpenAIEmbeddings
    embedder = OpenAIEmbeddings(model=EMBEDDING_MODEL, openai_api_key=os.getenv("OPENAI_API_KEY"))
    q_vector = await asyncio.to_thread(embedder.embed_query, query)

    # build filter
    from qdrant_client import models
    query_filter_parts = [models.FieldCondition(key="user_id", match=models.MatchValue(value=user_id))]
    if selected:
        query_filter_parts.append(
            models.FieldCondition(
                key="document_id",
                match=models.MatchAny(any=selected),
            )
        )
    qfilter = models.Filter(must=query_filter_parts)

    def _search():
        return qdrant_client.search(collection_name=collection_name, query_vector=q_vector, limit=top_k, query_filter=qfilter, with_payload=True)

    res = await asyncio.to_thread(_search)

    hits = []
    for hit in res:
        hits.append({
            "id": hit.id,
            "score": hit.score,
            "payload": hit.payload
        })

    return {"results": hits}
