from typing import Optional
from bson import ObjectId
from pymongo import AsyncMongoClient
from pymongo import ReturnDocument
from pydantic import BaseModel, ConfigDict
from uuid import uuid4
from datetime import datetime

from src.notes.schemas.notes import NoteIn, ListNotes, CreatedNote, Note
from src.notes.schemas.service import RequestStatus

# Aim to reply in json only
# document returns

class NoteDAL:
    def __init__(self, note_collection: AsyncMongoClient):
        self._note_collection = note_collection

    # create
    async def create_note(
            self,
            collection_id: str,
            data: NoteIn,
            session=None
        ):
        try:
            res = await self._note_collection.insert_one(
                {
                    'title': data.title,
                    'content': data.content,
                    'collection_id': ObjectId(collection_id),
                    'created_at': datetime.now(),
                    'updated_at': datetime.now()
                },session=session
            )

            return CreatedNote(note_id=str(res.inserted_id), status=True)
        except Exception as e:
            return RequestStatus(timestamp= datetime.now(), status=False, message=str(e))
    
    # a particular note
    async def get_note(self, note_id: str, session=None):
        res = await self._note_collection.find_one(
            {"_id": ObjectId(note_id)}, session=session
        )

        return Note.note_doc(res)
    
    # get notes of collection
    async def get_collection_notes(
        self,
        collection_id: str,
        session=None
    ) -> list[ListNotes]:
        
        notes = []
        async for doc in self._note_collection.find(
            {"collection_id": ObjectId(collection_id)},
            session=session
        ): 
            notes.append(ListNotes.list_doc(doc))
        
        return notes

    # update note title
    async def update_note_title(
        self,
        note_id: str,
        new_title: str,
        session=None
    ) -> RequestStatus:
        try:
            for note in self._note_collection.find({"_id": ObjectId(note_id)}):
                if note_id == note['_id']:
                    return RequestStatus(timestamp= datetime.now(), status=False, message="Note not found")
            res = await self._note_collection.find_one_and_update(
                {"_id": ObjectId(note_id)},
                {
                    "$set": {
                        "title": new_title,
                        "updated_at":datetime.now()
                    }
                },
                session=session,
                return_document=ReturnDocument.AFTER
            )
            
            if res is None:
                return RequestStatus(
                    timestamp=datetime.now(),
                    status=False,
                    message=f"Note not found"
                )
            
            return RequestStatus(
                timestamp=datetime.now(),
                status=True,
                message=f"Note title updated successfully"
            )
        except Exception as e:
            return RequestStatus(timestamp= datetime.now(), status=False, message=str(e))
    
    # need to update
    async def update_note_content(
        self,
        note_id: str,
        new_content: str,
        session=None
    ) -> RequestStatus:
        try:
            res = await self._note_collection.find_one_and_update(
                {"_id": ObjectId(note_id)},
                {
                    '$set': {
                        'content': new_content,
                        'updated_at': datetime.now()
                    },
                },
                session=session,
                return_document=ReturnDocument.AFTER
            )
            if res is None:
                return RequestStatus(
                    timestamp=datetime.now(),
                    status=False,
                    message=f"Note not found"
                )
            
            return RequestStatus(
                timestamp=datetime.now(),
                status=True,
                message=f"Note content updated successfully"
            )
        except Exception as e:
            return RequestStatus(timestamp= datetime.now(), status=False, message=str(e))
        
    # delete a note
    async def delete_note(
        self,
        note_id: str,
        session = None
    ) -> "RequestStatus":
        try:
            res = await self._note_collection.delete_one(
                {"_id": ObjectId(note_id)},
                session=session
            )

            return RequestStatus(timestamp= datetime.now(), status=True)
        except Exception as e:
            return RequestStatus(timestamp= datetime.now(), status=False, message=str(e))
    
    # # delete notes by collection
    # async def delete_notes_by_collection(
    #     self,
    #     collection_id: str,
    #     session=None
    # ) -> "RequestStatus":
    #     try:
    #         res = await self._note_collection.delete_many(
    #             {'collection_id': ObjectId(collection_id)},
    #             session=session
    #         )

    #         return RequestStatus(timestamp= datetime.now(), status=True) 
    #     except Exception as e:
    #         return RequestStatus(timestamp= datetime.now(), status=False, message=str(e))