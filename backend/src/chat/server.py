from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from main import get_ai_response

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class MessageInput(BaseModel):
    message: str

class MessageOutput(BaseModel):
    reply: str

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/api/bot", response_model=MessageOutput)
def chatbot(user_input: MessageInput):
    result = get_ai_response(user_input.message)
    # save at database
    return {"reply": result}

