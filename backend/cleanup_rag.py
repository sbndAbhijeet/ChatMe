import os
import shutil
from pathlib import Path
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def cleanup():
    # 1. Clean up MongoDB metadata
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "LuminAI_db")
    doc_collection = os.getenv("DOCUMENTS_DB", "documents")
    
    print(f"Connecting to MongoDB at {mongo_uri}...")
    try:
        client = MongoClient(mongo_uri)
        db = client[db_name]
        
        print(f"Dropping collection '{doc_collection}' in database '{db_name}'...")
        db[doc_collection].drop()
        print("MongoDB cleanup complete.")
    except Exception as e:
        print(f"Failed to clear MongoDB: {e}")

    # 2. Clean up local storage (PDFs and Qdrant vectors)
    storage_dir = Path(__file__).resolve().parent / "storage"
    
    pdfs_dir = storage_dir / "pdfs"
    if pdfs_dir.exists():
        print(f"Deleting PDFs directory: {pdfs_dir}")
        shutil.rmtree(pdfs_dir)
    
    qdrant_dir = storage_dir / "qdrant"
    if qdrant_dir.exists():
        print(f"Deleting Qdrant vector database directory: {qdrant_dir}")
        shutil.rmtree(qdrant_dir)
        
    print("\n✅ All RAG data (PDFs and embeddings) has been successfully deleted!")
    print("You can now safely restart your server and upload new PDFs with the new embedding model.")

if __name__ == "__main__":
    cleanup()
