from pydantic import BaseModel
from datetime import datetime

class NoteIn(BaseModel):
    title: str
    content: str

class NoteTitle(BaseModel):
    title: str

class NoteContent(BaseModel):
    content: str

class CreatedNote(BaseModel):
    note_id: str
    status: bool

class NoteModel(BaseModel):
    title: str
    content: str

    @staticmethod
    def parse_obj(doc):
        return NoteModel(
            title=doc['title'],
            content=doc['content'],
            collection_id=doc['collection_id']
        )
    
# Our Model
class Note(BaseModel):
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
    collection_id: str

    @staticmethod
    def note_doc(doc) -> "Note":
        return Note(
            title = doc['title'],
            content = doc['content'],
            created_at = doc['created_at'],
            updated_at = doc['updated_at'],
            collection_id = str(doc['collection_id'])
        )
    

class ListNotes(BaseModel):
    note_id: str
    blog_id: str
    title: str
    updated_at: datetime
    # content: str

    @staticmethod
    def list_doc(doc) -> "ListNotes":
        return ListNotes(
            note_id=str(doc['_id']),
            blog_id=str(doc['collection_id']),
            title = doc['title'],
            updated_at = doc['updated_at']
            # content=doc['content']
        )