from typing import Optional, List
from bson import ObjectId
from pymongo import ReturnDocument
from datetime import datetime
from qdrant_client import QdrantClient, models

class DocumentDAL:
    def __init__(self, collection):
        self._col = collection

    async def create_document(self, metadata: dict, session=None) -> dict:
        metadata = metadata.copy()
        metadata.update({
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        res = await self._col.insert_one(metadata, session=session)
        doc = await self._col.find_one({"_id": res.inserted_id})
        doc["_id"] = str(doc["_id"])
        return doc

    async def get_by_hash(self, pdf_hash: str, user_id: Optional[str] = None) -> Optional[dict]:
        query = {"pdf_hash": pdf_hash}
        if user_id:
            query["user_id"] = user_id
        doc = await self._col.find_one(query)
        if not doc:
            return None
        doc["_id"] = str(doc["_id"])
        return doc

    async def list_documents(self, user_id: Optional[str] = None) -> List[dict]:
        query = {}
        if user_id:
            query["user_id"] = user_id
        docs = []
        async for d in self._col.find(query):
            d["_id"] = str(d["_id"])
            docs.append(d)
        return docs

    async def get_document(self, document_id: str) -> Optional[dict]:
        doc = await self._col.find_one({"_id": ObjectId(document_id)})
        if not doc:
            return None
        doc["_id"] = str(doc["_id"])
        return doc

    async def delete_document(self, document_id: str) -> bool:
        res = await self._col.delete_one({"_id": ObjectId(document_id)})
        return res.deleted_count > 0


class QdrantDAL:
    def __init__(self, client: QdrantClient, collection_name: str):
        self.client = client
        self.collection_name = collection_name

    def ensure_collection(self, vector_size: int = 1536):
        existing = self.client.get_collections().collections
        names = [c.name for c in existing]
        if self.collection_name not in names:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(size=vector_size, distance=models.Distance.COSINE),
            )

    def upsert_points(self, points: List[models.PointStruct]):
        self.client.upsert(collection_name=self.collection_name, points=points)

    def delete_points_by_filter(self, flt: models.Filter):
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=models.FilterSelector(filter=flt),
        )

    def delete_points_by_document(self, document_id: str, user_id: str):
        flt = models.Filter(
            must=[
                models.FieldCondition(key="user_id", match=models.MatchValue(value=user_id)),
                models.FieldCondition(key="document_id", match=models.MatchValue(value=document_id)),
            ]
        )
        self.delete_points_by_filter(flt)

    def query_vectors(self, query_vector: List[float], user_id: str, selected_document_ids: List[str], top_k: int = 5):
        if not user_id or not selected_document_ids:
            return []
        qfilter = models.Filter(
            must=[
                models.FieldCondition(key="user_id", match=models.MatchValue(value=user_id)),
                models.FieldCondition(
                    key="document_id",
                    match=models.MatchAny(any=selected_document_ids),
                ),
            ]
        )

        result = self.client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            limit=top_k,
            query_filter=qfilter,
            with_payload=True,
        )

        return getattr(result, "points", result)

    def search(self, query_vector: List[float], query_filter: Optional[models.Filter] = None, top_k: int = 5):
        return self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=top_k,
            query_filter=query_filter,
            with_payload=True,
        )
