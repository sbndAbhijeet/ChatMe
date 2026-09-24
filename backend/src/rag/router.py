from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from pathlib import Path
import asyncio
import logging
import os
import uuid
from openai import OpenAI
from datetime import datetime

from ..auth.dependencies import get_current_user
from .dal import DocumentDAL
from .processor import process_pdf_and_upsert, sha256_of_file
from .dal import QdrantDAL
from qdrant_client import models


router = APIRouter(prefix="/api/rag", tags=["rag"])

STORAGE_DIR = Path(os.getenv("PDF_STORAGE_DIR") or Path(__file__).resolve().parents[2] / "storage" / "pdfs")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
EMBED_MODEL = os.getenv("EMBED_MODEL")
MAX_PDF_SIZE_MB = int(os.getenv("MAX_PDF_SIZE_MB", "10"))
if MAX_PDF_SIZE_MB <= 0:
    raise RuntimeError("MAX_PDF_SIZE_MB must be positive")
MAX_PDF_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024
logger = logging.getLogger(__name__)


@router.post("/upload")
async def upload_pdf(
    request: Request,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    app = request.app
    doc_dal: DocumentDAL = app.state.document_dal
    qdrant_dal: QdrantDAL = app.state.qdrant_dal

    # save file temporarily
    filename = f"{uuid.uuid4().hex}.pdf"
    out_path = STORAGE_DIR / filename
    doc = None
    try:
        if not (file.filename or "").lower().endswith(".pdf"):
            raise HTTPException(415, "Only PDF files are supported")

        total_bytes = 0
        with out_path.open("wb") as output:
            while chunk := await file.read(1024 * 1024):
                if total_bytes == 0 and not chunk.startswith(b"%PDF-"):
                    raise HTTPException(415, "File content is not a PDF")
                total_bytes += len(chunk)
                if total_bytes > MAX_PDF_BYTES:
                    raise HTTPException(413, f"PDF exceeds the {MAX_PDF_SIZE_MB} MB limit")
                output.write(chunk)
        if total_bytes == 0:
            raise HTTPException(422, "PDF is empty")

        pdf_hash = sha256_of_file(out_path)
        existing = await doc_dal.get_by_hash(pdf_hash, user_id=user_id)
        if existing:
            return JSONResponse({"status": "exists", "document": existing})

        metadata = {
            "user_id": user_id,
            "filename": file.filename,
            "stored_filename": filename,
            "pdf_hash": pdf_hash,
            "uploaded_at": datetime.utcnow(),
        }
        doc = await doc_dal.create_document(metadata)

        # The PDF is retained only until embedding completes.
        def _proc():
            return process_pdf_and_upsert(qdrant_dal, out_path, str(doc["_id"]), user_id, pdf_hash)

        inserted_chunks = await asyncio.to_thread(_proc)
        if inserted_chunks == 0:
            raise HTTPException(422, "PDF has no extractable text")
        return {"status": "ok", "document": doc, "chunks_indexed": inserted_chunks}
    except Exception:
        if doc:
            document_id = str(doc["_id"])
            try:
                await asyncio.to_thread(qdrant_dal.delete_points_by_document, document_id, user_id)
            except Exception:
                logger.exception("Failed to clean up vectors for PDF %s", document_id)
            try:
                await doc_dal.delete_document(document_id)
            except Exception:
                logger.exception("Failed to clean up metadata for PDF %s", document_id)
        raise
    finally:
        # Search uses Qdrant, so the original PDF need not occupy local disk.
        out_path.unlink(missing_ok=True)


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
    qdrant_dal: QdrantDAL = app.state.qdrant_dal

    doc = await doc_dal.get_document(document_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    if doc.get("user_id") != user_id:
        raise HTTPException(403, "Not allowed to delete this document")

    # delete vectors (blocking qdrant call)
    def _del():
        qdrant_dal.delete_points_by_document(document_id, user_id)

    await asyncio.to_thread(_del)

    # delete metadata
    deleted = await doc_dal.delete_document(document_id)
    # delete stored file
    if doc.get("stored_filename"):
        stored = STORAGE_DIR / doc["stored_filename"]
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
    qdrant_dal: QdrantDAL = app.state.qdrant_dal
    query = payload.get("query")
    selected = payload.get("selected_document_ids")
    top_k = int(payload.get("top_k", 5))
    if not query:
        raise HTTPException(400, "query required")

    from langchain_huggingface import HuggingFaceEmbeddings
    embedder = HuggingFaceEmbeddings(model_name=EMBED_MODEL)
    q_vector = embedder.embed_query(query)

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
        return qdrant_dal.search(query_vector=q_vector, query_filter=qfilter, top_k=top_k)

    res = await asyncio.to_thread(_search)

    hits = []
    for hit in res:
        hits.append({
            "id": hit.id,
            "score": hit.score,
            "payload": hit.payload
        })

    return {"results": hits}
