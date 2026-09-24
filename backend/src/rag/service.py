from __future__ import annotations

from typing import Iterable
import os

from langchain_huggingface import HuggingFaceEmbeddings

from .dal import QdrantDAL

import os
from dotenv import load_dotenv

load_dotenv()

EMBED_MODEL = os.getenv("EMBED_MODEL")

def build_pdf_context(
    query: str,
    *,
    selected_document_ids: list[str] | None,
    user_id: str,
    qdrant_dal: QdrantDAL,
    api_key: str | None = None,
    top_k: int = 5,
) -> str:
    """
    Build a retrieval context string from the selected PDFs.

    This function owns the RAG retrieval details:
    - embeds the query
    - filters by the selected document ids
    - pulls matching chunks from Qdrant
    - formats a system-message-ready context string
    """
    if not query.strip():
        return ""

    if not selected_document_ids or not user_id or not qdrant_dal:
        return ""

    embedder = HuggingFaceEmbeddings(model_name=EMBED_MODEL)
    q_vector = embedder.embed_query(query)
    hits = qdrant_dal.query_vectors(
        q_vector,
        user_id=user_id,
        selected_document_ids=selected_document_ids,
        top_k=top_k,
    )

    if not hits:
        return "No matching PDF excerpts were found for the selected documents."

    snippets: list[str] = []
    for hit in hits:
        payload = hit.payload or {}
        snippets.append(
            f"Source: {payload.get('filename', '')} | chunk: {payload.get('chunk_index', '')}\n"
            f"{(payload.get('text') or '')[:1200]}"
        )

    return "Relevant local PDF excerpts:\n" + "\n---\n".join(snippets)
