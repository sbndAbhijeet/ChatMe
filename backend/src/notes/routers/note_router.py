from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel, ConfigDict
from bson import ObjectId
from src.notes.dal.note_dal import NoteDAL

from typing import Optional
import datetime

router = APIRouter(prefix="/api/blog/note")

class NoteModel(BaseModel):

    title: str
    content: str
    collection_id: str

    @staticmethod
    def parse_obj(doc):
        return NoteModel(
            title=doc['title'],
            content=doc['content'],
            collection_id=doc['collection_id']
        )
    
# still need to work on how to send error console to frontend to show smooth working, without breaking website

# Note
@router.post("/") # note_data in payload
async def create_note(note_data: NoteModel, request: Request):
    note_dal = request.app.state.note_dal
    return await note_dal.create_note(note_data.collection_id, note_data) # returning id with status

@router.get('/{note_id}')
async def get_note(note_id: str, request: Request):
    note_dal = request.app.state.note_dal
    return await note_dal.get_note(note_id)


@router.get('/{collection_id}/notes')
async def get_notes(collection_id: str, request: Request):
    note_dal = request.app.state.note_dal
    return await note_dal.get_collection_notes(collection_id)
    # the note of the type title, content


@router.patch('/title/{note_id}') # rename_title in payload
async def update_note_title(note_id: str, new_title: str, request: Request):
    note_dal = request.app.state.note_dal
    return await note_dal.update_note_title(note_id, new_title)


@router.patch('/content/{note_id}')
async def update_note_content(
    note_id: str,
    new_content: str,
    request: Request
):
    note_dal = request.app.state.note_dal
    return await note_dal.update_note_content(note_id, new_content)
    

@router.delete('/{note_id}')
async def delete_note(
    note_id: str,
    request: Request
):
    note_dal = request.app.state.note_dal
    return await note_dal.delete_note(note_id)
    