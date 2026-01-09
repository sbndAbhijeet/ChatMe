from typing import Optional
from bson import ObjectId
from pymongo import AsyncMongoClient
from pymongo import ReturnDocument
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime

# Database models

    
class Collection(BaseModel):
    name: str
    created_at: datetime


class ListCollections(BaseModel):
    name: str
    created_at: datetime

    @staticmethod
    def from_doc(doc) -> "ListCollections":
        return ListCollections(
            name=doc['name'],
            created_at=doc['created_at']
        )
    
class RequestStatus(BaseModel):
    timestamp: datetime
    status: bool #False -> fail
    message: Optional[str] = None

class CreatedCollection(BaseModel):
    collection_id: str
    status: bool


class BlogDAL:
    def __init__(self, blog_collection: AsyncMongoClient):
        self._blog_collection = blog_collection

    # Collections
    # create
    async def create_collection(self, name: str, session=None):
        try:
            res = await self._blog_collection.insert_one(
                {
                    "name": name,
                    "created_at": datetime.now(),
                },session=session
            )
            print("Everything is good")
            return CreatedCollection(collection_id=str(res.inserted_id), status=True)
        except Exception as e:
            print("Something went wrong")
            return RequestStatus(timestamp=datetime.now(), status=False, message=str(e))
    
    # get a single collection
    # async def get_collection(self, id: str,session=None):
    #     res = await self._blog_collection.find_one(
    #         {"_id": ObjectId(id)},
    #         session=session
    #     )

    #     return res

    # collection existance
    async def collection_exists(self, collection_id: ObjectId, session=None) -> bool:
        count = await self._blog_collection.count_documents(
            {"_id": collection_id},
            session=session
        )
        return count > 0
    
    # get all collections
    async def list_collections(self, session=None):
        async for doc in self._blog_collection.find({}):
            yield ListCollections.from_doc(doc)
    
    # update
    async def rename_collection(self, id: str, name: str, session=None) -> RequestStatus:
        try:
            res = await self._blog_collection.find_one_and_update(
                {"_id": ObjectId(id)},
                {
                    "$set": {
                        "name": name,
                    }
                },
                session=session,
                return_document=ReturnDocument.AFTER
            )

            return RequestStatus(timestamp=datetime.now(), status=True)
        except Exception as e:
            return RequestStatus(timestamp=datetime.now(), status=False, message=str(e))
    
    # delete
    async def delete_collection(self, collection_id: str, session=None) -> RequestStatus:
        try:
                res = await self._blog_collection.delete_one(
                    {"_id": ObjectId(collection_id)},
                    session=session
                )

                return RequestStatus(timestamp=datetime.now(), status=True)
        except Exception as e:
            return RequestStatus(timestamp= datetime.now(), status=False, message=str(e))
    