from pydantic import BaseModel
from src.notes.schemas.notes import NoteIn
from datetime import datetime

class BlogName(BaseModel):
    blog_name: str

class BlogNote(BaseModel):
    blog_name: str
    note: NoteIn

# document returns
class CreateCollectionNoteResponse(BaseModel):
    collection_id: str
    note_id: str
    status: bool

class Collection(BaseModel):
    name: str
    created_at: datetime

class CreatedCollection(BaseModel):
    collection_id: str
    status: bool

class RenameCollectionRequest(BaseModel):
    blog_name: str

class ListCollections(BaseModel):
    blog_id: str
    blog_name: str
    created_at: datetime

    @staticmethod
    def from_doc(doc) -> "ListCollections":
        return ListCollections(
            blog_id=str(doc['_id']),
            blog_name=doc['name'],
            created_at=doc['created_at']
        )
    

