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
