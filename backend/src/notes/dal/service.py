from typing import Optional
from bson import ObjectId
from pymongo import AsyncMongoClient
from pymongo import ReturnDocument
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime
from src.notes.dal.blog_dal import BlogDAL
from src.notes.dal.note_dal import NoteDAL
from src.notes.schemas.notes import NoteIn
from src.notes.schemas.service import RequestStatus
from src.notes.schemas.blogs import BlogNote, CreateCollectionNoteResponse


class CollectionService:
    def __init__(self, blog_dal: BlogDAL, note_dal: NoteDAL, client):
        self._blog_dal = blog_dal
        self._note_dal = note_dal
        self.client = client

    # Create blog along with note
    async def create_collection_and_note(
        self,
        collection_name: str,
        note_data: NoteIn,
        session=None
    ):
        try:
            collection_res = await self._blog_dal.create_collection(
                blog_name=collection_name,
                session=session
            )

            note_res = await self._note_dal.create_note(
                collection_id=str(collection_res.collection_id),
                data=note_data,
                session=session
            )

            print(collection_res.collection_id)
            return CreateCollectionNoteResponse(
                collection_id=str(collection_res.collection_id),
                note_id=str(note_res.note_id),
                status=True
            )
                
        except Exception as e:
            return RequestStatus(timestamp=datetime.now(), status=False, message=str(e))
            
    # Delete Collection along with related notes
    async def delete_collection(
        self,
        collection_id: str,
        session=None
    ) -> RequestStatus:
        collection_exists = await self._blog_dal.collection_exists(collection_id=ObjectId(collection_id))

        if not collection_exists:
            return RequestStatus(timestamp=datetime.now(), status=False, message="Collection does not exist")
        try:
            
            await self._note_dal.delete_notes_by_collection(
                collection_id=ObjectId(collection_id),
                session=session
            )
            
            blog_res = await self._blog_dal.delete_collection(
                collection_id=ObjectId(collection_id),
                session=session
            )

            # Check result BEFORE committing
            if blog_res.status == False:
                await session.abort_transaction()  # Abort here
                return RequestStatus(
                    timestamp=datetime.now(), 
                    status=False, 
                    message="Collection not found"
                )

            return RequestStatus(timestamp=datetime.now(), status=True)
        

        except Exception as e:
            return RequestStatus(timestamp=datetime.now(),status=False, message=str(e))