from typing import List, Optional
import os
from pathlib import Path
from qdrant_client import QdrantClient, models

QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "documents_collection")
DEFAULT_QDRANT_PATH = Path(__file__).resolve().parents[2] / "storage" / "qdrant"


def init_qdrant(path: Optional[str] = None, url: Optional[str] = None, api_key: Optional[str] = None) -> QdrantClient:
    if url:
        client = QdrantClient(url=url, api_key=api_key)
    else:
        # local mode persisted to disk by default
        storage_path = Path(path) if path else DEFAULT_QDRANT_PATH
        storage_path.mkdir(parents=True, exist_ok=True)
        client = QdrantClient(path=str(storage_path))
    return client


def ensure_collection(client: QdrantClient, collection_name: str, vector_size: int = 1536):
    existing = client.get_collections().collections
    names = [c.name for c in existing]
    if collection_name in names:
        return
    client.create_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(size=vector_size, distance=models.Distance.COSINE),
    )


def upsert_points(client: QdrantClient, collection_name: str, points: List[models.PointStruct]):
    client.upsert(collection_name=collection_name, points=points)


def delete_points_by_filter(client: QdrantClient, collection_name: str, flt: models.Filter):
    client.delete(
        collection_name=collection_name,
        points_selector=models.FilterSelector(filter=flt),
    )


def delete_points_by_document(client: QdrantClient, collection_name: str, document_id: str):
    # delete all points where payload.document_id == document_id
    flt = models.Filter(must=[models.FieldCondition(key="document_id", match=models.MatchValue(value=document_id))])
    delete_points_by_filter(client, collection_name, flt)


def query_vectors(client: QdrantClient, collection_name: str, query_vector: List[float], selected_document_ids: Optional[List[str]] = None, top_k: int = 5):
    qfilter = None
    if selected_document_ids:
        qfilter = models.Filter(
            must=[
                models.FieldCondition(
                    key="document_id",
                    match=models.MatchAny(any=selected_document_ids),
                )
            ]
        )

    # QdrantClient versions vary: local mode uses query_points(...) rather than search(...)
    result = client.query_points(
        collection_name=collection_name,
        query=query_vector,
        limit=top_k,
        query_filter=qfilter,
        with_payload=True,
    )

    # query_points may return a response object with `.points` or a plain iterable depending on version.
    return getattr(result, "points", result)
