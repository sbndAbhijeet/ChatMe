from __future__ import annotations

from typing import Iterable
import os

from langchain_openai import OpenAIEmbeddings

from src.rag.qdrant_client import query_vectors

import os
from dotenv import load_dotenv

load_dotenv()

EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")

def build_pdf_context(
    query: str,
    *,
    selected_document_ids: list[str] | None,
    qdrant_client,
    qdrant_collection: str | None,
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

    if not selected_document_ids or not qdrant_client or not qdrant_collection:
        return ""

    embedder = OpenAIEmbeddings(
        model=EMBEDDING_MODEL,
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )
    q_vector = embedder.embed_query(query)
    hits = query_vectors(
        qdrant_client,
        qdrant_collection,
        q_vector,
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
