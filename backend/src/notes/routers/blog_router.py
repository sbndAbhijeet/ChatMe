from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel
from src.notes.dal.blog_dal import BlogDAL, ListCollections
from src.notes.dal.service import CollectionService

from typing import Optional
import datetime

router = APIRouter(prefix="/api/blog")

class BlogModel(BaseModel):
    title: str

class NoteIn(BaseModel):
    title: str
    content: str

@router.post('/')
async def create_collection(name: str, request: Request):
    blog_dal = request.app.state.blog_dal
    return await blog_dal.create_collection(name)

@router.post('/blog_note/')
async def create_collection_and_note(collection_name: str, note: NoteIn, request: Request):
    collection_service = request.app.state.collection_service
    return await collection_service.create_collection_and_note(collection_name, note)

@router.get('/')
async def get_collections(request: Request) -> list[ListCollections]:
    blog_dal = request.app.state.blog_dal
    collections = []
    async for collection in blog_dal.list_collections():
        collections.append(collection)
    
    return collections

@router.patch('/{collection_id}')
async def rename_collection(collection_id: str, new_name: str, request: Request):
    blog_dal = request.app.state.blog_dal
    return await blog_dal.rename_collection(collection_id, new_name)

@router.delete('/{collection_id}')
async def delete_collection(collection_id: str, request: Request):
    collection_service = request.app.state.collection_service
    return await collection_service.delete_collection(collection_id)