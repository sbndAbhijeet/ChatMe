from typing import Optional, List
from bson import ObjectId
from pymongo import ReturnDocument
from datetime import datetime

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
