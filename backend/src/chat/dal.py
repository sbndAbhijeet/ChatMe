from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection
from pymongo import ReturnDocument
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime, timezone

from langgraph.checkpoint.mongodb import MongoDBSaver

from ..chat.main import COLLECTION_NAME, DB_URI

# Need to change the motor to pymongo (Will be deprecated soon)

class HistorySummary(BaseModel):# deatiled history of each chat
    id: str
    title: str
    messages: list
    messages_count: int

    @staticmethod
    def from_doc(doc) -> "HistorySummary":
        return HistorySummary(
            id=str(doc["_id"]),
            title=doc["title"],
            messages=doc["messages"],
            messages_count=doc["messages_count"]
        )

class ChatMessages(BaseModel):
    id: str
    sender: str
    message: str

    @staticmethod
    def from_doc(item) -> "ChatMessages":
        return ChatMessages(
            id=item["id"],
            sender=item["sender"],
            message=item["message"]
        )
    
class ChatList(BaseModel):
    id: str
    title: str
    messages: list[ChatMessages]

    @staticmethod
    def from_doc(doc) -> "ChatList":
        return ChatList(
            id=str(doc["_id"]),
            title=doc["title"],
            messages=[ChatMessages.from_doc(item) for item in doc["messages"]]
        )

class ChatBot:
    def __init__(self, chatbot_collection: AsyncIOMotorCollection):
        self._chatbot_collection = chatbot_collection

    @staticmethod
    def _utc_now() -> datetime:
        return datetime.now(timezone.utc)

    @staticmethod
    def _cleanup_langgraph_thread(thread_id: str) -> None:
        if not DB_URI:
            return
        try:
            with MongoDBSaver.from_conn_string(DB_URI, "LuminAI_db", COLLECTION_NAME) as saver:
                saver.delete_thread(thread_id)
        except Exception as exc:
            print(f"LangGraph checkpoint cleanup failed for thread {thread_id}: {exc}")

    async def is_new_thread(
            self, 
            id: str | ObjectId,
            user_id: str,
        ):
        "Returns True if this chat thread has no messages yet or invalid chat id"
        doc_id = ObjectId(id)
        doc = await self._chatbot_collection.find_one({
            "_id": doc_id,
            "user_id": user_id
        }, {"messages": 1})

        # if the doc dosen't exist or messages array is empty -> new thread
        if doc is None:
            return True
        if not doc.get("messages"): #empty list or None
            return True
        
        return False
    
    async def create_new_chat(self, user_id: str, session=None) -> str:
        now = self._utc_now()
        response = await self._chatbot_collection.insert_one(
            {
                "user_id": user_id,
                "title": "New Chat",
                "messages": [],
                "created_at": now,
                "updated_at": now,
            },
            session=session,
        )
        return str(response.inserted_id)
    
    async def get_chat_history(self, user_id: str, session=None):
        fallback_epoch = datetime(1970, 1, 1, tzinfo=timezone.utc)
        cursor = await self._chatbot_collection.aggregate(
            [
                {
                    "$match": {"user_id": user_id}
                },
                {
                    "$addFields": {
                        "activity_ts": {
                            "$ifNull": ["$updated_at", {"$ifNull": ["$created_at", fallback_epoch]}]
                        }
                    }
                },
                {
                    "$project":{
                        "_id": 1,
                        "title": 1,
                        "messages": 1,
                        "created_at": 1,
                        "updated_at": 1,
                        "activity_ts": 1,
                        "messages_count": {
                            "$size": "$messages"
                        }   
                    }
                },
                {
                    "$sort": {"activity_ts": -1, "_id": -1}
                }
            ]
        )

        async for doc in cursor:
            yield HistorySummary.from_doc(doc)

    async def get_current_chat(
        self,
        id: str | ObjectId,
        user_id: str,
        session=None
    ):
        result = await self._chatbot_collection.find_one(
            {"_id": ObjectId(id), "user_id": user_id},
            session=session
        )
        if result: 
            print(result)
        else:
            print("Not found!")
        return result
        

    async def save_sender_response(
            self,
            id: str | ObjectId,
            sender: str,
            msg: str,
            user_id: str,
            session=None
        ):
        result = await self._chatbot_collection.find_one_and_update(
            {"_id": ObjectId(id), "user_id": user_id},
            {
                "$push": {
                    "messages":{
                        "id": uuid4().hex,
                        "sender": sender,
                        "message": msg,
                    }   
                },
                "$set": {
                    "updated_at": self._utc_now(),
                }
            },
            session=session,
            return_document=ReturnDocument.AFTER,
        )

        if result:
            return ChatList.from_doc(result)
        
    async def delete_chat(
            self,
            doc_id: str | ObjectId,
            user_id: str,
            session=None
        ) -> bool:
            response = await self._chatbot_collection.delete_one(
                {"_id": ObjectId(doc_id), "user_id": user_id},
                session=session
            )
            if response.deleted_count == 1:
                self._cleanup_langgraph_thread(str(doc_id))
            return response.deleted_count == 1
    
    async def rename_chat_title(
            self,
            id: str | ObjectId,
            title: str,
            user_id: str,
            session=None
        ) -> ChatList | None:
        result = await self._chatbot_collection.find_one_and_update(
            {"_id": ObjectId(id), "user_id": user_id},
            {
                "$set": {
                    "title": title,
                    "updated_at": self._utc_now(),
                }
            },
            session=session,
            return_document=ReturnDocument.AFTER
        )

        if result:
            return ChatList.from_doc(result)