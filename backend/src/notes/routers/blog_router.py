from fastapi import APIRouter, Depends, Request, HTTPException, status
from pydantic import BaseModel


from src.auth.dependencies import get_current_user

from src.notes.dal.blog_dal import BlogDAL, ListCollections
from src.notes.dal.service import CollectionService
from src.notes.schemas.blogs import BlogName, BlogNote, RenameCollectionRequest

from typing import Optional
import datetime

router = APIRouter(prefix="/api/blog", tags=["Blogs"], dependencies=[Depends(get_current_user)])


@router.post('/')
async def create_collection(blog: BlogName, request: Request, user_id: str = Depends(get_current_user)):
    blog_dal = request.app.state.blog_dal
    return await blog_dal.create_collection(blog.blog_name, user_id)

@router.post('/blog_note/')
async def create_collection_and_note(data: BlogNote, request: Request, user_id: str = Depends(get_current_user)):
    collection_service = request.app.state.collection_service
    return await collection_service.create_collection_and_note(data.blog_name, data.note, user_id)

@router.get('/')
async def get_collections(request: Request, user_id: str = Depends(get_current_user)):
    blog_dal = request.app.state.blog_dal
    return await blog_dal.list_collections(user_id)

@router.patch('/{collection_id}')
async def rename_collection(
    collection_id: str,
    payload: RenameCollectionRequest,
    request: Request,
    user_id: str = Depends(get_current_user)
    ):
    blog_dal = request.app.state.blog_dal
    return await blog_dal.rename_collection(collection_id, payload.blog_name, user_id)

@router.delete('/{collection_id}')
async def delete_collection(collection_id: str, request: Request, user_id: str = Depends(get_current_user)):
    collection_service = request.app.state.collection_service
    return await collection_service.delete_collection(collection_id, user_id)