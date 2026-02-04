from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel, ConfigDict
from bson import ObjectId

from src.notes.schemas.notes import NoteModel, NoteTitle, NoteContent
from src.notes.dal.note_dal import NoteDAL

from typing import Optional
import datetime

router = APIRouter(prefix="/api/blog/note")


    
# still need to work on how to send error console to frontend to show smooth working, without breaking website

# Note
@router.post("/{blog_id}") # note_data in payload
async def create_note(blog_id: str, note_data: NoteModel, request: Request):
    note_dal = request.app.state.note_dal
    return await note_dal.create_note(blog_id, note_data) # returning id with status

@router.get('/{note_id}')
async def get_note(note_id: str, request: Request):
    note_dal = request.app.state.note_dal
    return await note_dal.get_note(note_id)


@router.get('/{collection_id}/notes')
async def get_notes(collection_id: str, request: Request):
    note_dal = request.app.state.note_dal
    return await note_dal.get_collection_notes(collection_id)
    # the note of the type title, content


# @router.patch('/title/{note_id}') # rename_title in payload
# async def update_note_title(note_id: str, data: NoteTitle, request: Request):
#     note_dal = request.app.state.note_dal
#     return await note_dal.update_note_title(note_id, data.title)


@router.patch('/{note_id}')
async def update_note(
    note_id: str,
    data: NoteModel,
    request: Request
):
    print(data)
    note_dal = request.app.state.note_dal
    return await note_dal.update_note(note_id, data)
    

@router.delete('/{note_id}')
async def delete_note(
    note_id: str,
    request: Request
):
    note_dal = request.app.state.note_dal
    return await note_dal.delete_note(note_id)
    