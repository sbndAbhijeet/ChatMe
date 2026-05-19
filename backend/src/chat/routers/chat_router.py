from fastapi import APIRouter, Depends, FastAPI, HTTPException, status, WebSocket, Request
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from bson import ObjectId
from pydantic import BaseModel

from src.auth.dependencies import get_current_user

from ..main import get_ai_response, generate_title
import uvicorn

from dotenv import load_dotenv
from ..dal import ChatBot, HistorySummary

router = APIRouter(prefix="/api/chat", tags=["Chat"], dependencies=[Depends(get_current_user)])



class MessageInput(BaseModel):
    message: str
    tools: list
    model: str
    selected_document_ids: list | None = None

class MessageOutput(BaseModel):
    reply: str

class RenameRequest(BaseModel):
    title: str

@router.get("/")
def read_root():
    return {"Hello": "World"}

# chatHistory data getting
@router.get("/chat_history")
async def get_chatbot_history(
    req: Request,
    user: str = Depends(get_current_user)
) -> list[HistorySummary]:
    return  [item async for item in req.app.state.chatbot_dal.get_chat_history(user)]

class ChatModel(BaseModel):
    id: str
    messages: list

@router.get("/chat_session/{doc_id}")
async def get_current_chat(
    doc_id: str,
    req: Request,
    user_id: str = Depends(get_current_user)
):
    chat = await req.app.state.chatbot_dal.get_current_chat(doc_id, user_id)
    return {"id": str(chat["_id"]), "messages": chat["messages"]}

@router.post("/chatbot/lists/{chat_id}", status_code=status.HTTP_201_CREATED)
async def create_new_chat(
    chat_id: int,
    req: Request,
    user_id: str = Depends(get_current_user)
):
    return {
        "id": await req.app.state.chatbot_dal.create_new_chat(chat_id, user_id),
        "title": f"New Chat - {chat_id}"
    }


@router.post("/save_response/{id}" , response_model=MessageOutput)
async def process_save_responses(
    id: str,
    user_input: MessageInput,
    req: Request,
    user_id: str = Depends(get_current_user)
):
    # print(f"Received request: id={id}, message={user_input.message}"
    try:
        object_id = ObjectId(id)  # Convert string to ObjectId
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    user = await req.app.state.user_dal.get_user_by_id(user_id)
    user_api_key = user.get("openrouter_api_key") if user else None
    
    is_new = await req.app.state.chatbot_dal.is_new_thread(object_id, user_id)

    # pass selected document ids and qdrant client/collection for RAG retrieval
    q_client = req.app.state.qdrant_client
    q_collection = req.app.state.qdrant_collection

    result = await get_ai_response(user_input.message, id, user_input.tools, user_input.model, user_api_key, selected_document_ids=user_input.selected_document_ids, qdrant_client=q_client, qdrant_collection=q_collection)


    await req.app.state.chatbot_dal.save_sender_response(object_id, "user", user_input.message, user_id)
    # persist selected document ids as a separate system message for traceability
    if user_input.selected_document_ids:
        import json
        await req.app.state.chatbot_dal.save_sender_response(object_id, "system", f"selected_documents:{json.dumps(user_input.selected_document_ids)}", user_id)
    await req.app.state.chatbot_dal.save_sender_response(object_id, "bot", result, user_id)

    # Rewriting Title for new Chats
    # print(is_new)
    if is_new:
        new_title = await generate_title(user_input.message, user_api_key)
        print("new title: ",new_title)
        await req.app.state.chatbot_dal.rename_chat_title(id, new_title, user_id)
        
    return {"reply": result}

@router.delete("/delete_chat/{doc_id}")
async def delete_chat(
    doc_id: str,
    req: Request,
    user_id: str = Depends(get_current_user)
) -> bool:
    return await req.app.state.chatbot_dal.delete_chat(doc_id, user_id)


@router.patch("/chat_rename/{doc_id}")
async def rename_chat_title(
    doc_id: str, 
    request: RenameRequest, 
    req: Request,
    user_id: str = Depends(get_current_user)
):
    return await req.app.state.chatbot_dal.rename_chat_title(doc_id, request.title, user_id)
