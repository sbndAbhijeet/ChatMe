from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection
from pymongo import ReturnDocument
from pydantic import BaseModel
from uuid import uuid4



class HistorySummary(BaseModel):
    id: str
    chat_id: int
    title: str
    messages: list
    messages_count: int

    @staticmethod
    def from_doc(doc) -> "HistorySummary":
        return HistorySummary(
            id=str(doc["_id"]),
            chat_id=doc["chat_id"],
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
    chat_id: int
    title: str
    messages: list[ChatMessages]

    @staticmethod
    def from_doc(doc) -> "ChatList":
        return ChatList(
            id=str(doc["_id"]),
            chat_id=doc["chat_id"],
            title=doc["title"],
            messages=[ChatMessages.from_doc(item) for item in doc["messages"]]
        )

class ChatBot:
    def __init__(self, chatbot_collection: AsyncIOMotorCollection):
        self._chatbot_collection = chatbot_collection

    async def is_new_thread(self, id: str | ObjectId):
        "Returns True if this chat thread has no messages yet"
        doc_id = ObjectId(id)
        doc = await self._chatbot_collection.find_one({"_id": doc_id}, {"messages": 1})

        # if the doc dosen't exist or messages array is empty -> new thread
        if doc is None:
            return True
        if not doc.get("messages"): #empty list or None
            return True
        
        return False
    
    async def create_new_chat(self, chat_id: int, session=None) -> str:
        response = await self._chatbot_collection.insert_one(
            {
                "chat_id": chat_id,
                "title": f"New Chat - {chat_id}",
                "messages": [],
            },
            session=session,
        )
        return str(response.inserted_id)
    
    async def get_chat_history(self, session=None):
        cursor = self._chatbot_collection.aggregate(
            [
                {
                    "$project":{
                        "_id": 1,
                        "chat_id": 1,
                        "title": 1,
                        "messages": 1,
                        "messages_count": {
                            "$size": "$messages"
                        }   
                    }
                },
                {
                    "$sort": {"chat_id": 1}
                }
            ]
        )

        async for doc in cursor:
            yield HistorySummary.from_doc(doc)

    async def get_current_chat(
        self,
        id: str | ObjectId,
        session=None
    ):
        result = await self._chatbot_collection.find_one(
            {"_id": ObjectId(id)},
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
            session=None
        ):
        result = await self._chatbot_collection.find_one_and_update(
            {"_id": ObjectId(id)},
            {
                "$push": {
                    "messages":{
                        "id": uuid4().hex,
                        "sender": sender,
                        "message": msg,
                    }   
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
            session=None
        ) -> bool:
            response = await self._chatbot_collection.delete_one(
                {"_id": ObjectId(doc_id)},
                session=session
            )
            return response.deleted_count == 1
    
    async def rename_chat_title(
            self,
            id: str | ObjectId,
            title: str,
            session=None
        ) -> ChatList | None:
        result = await self._chatbot_collection.find_one_and_update(
            {"_id": ObjectId(id)},
            {
                "$set": {
                    "title": title
                }
            },
            session=session,
            return_document=ReturnDocument.AFTER
        )

        if result:
            return ChatList.from_doc(result)