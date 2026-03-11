from fastapi import APIRouter, Depends
from models import MemoryResponse
from utils.security import get_current_user
from database import get_db
from typing import List, Dict

router = APIRouter()

@router.get("/mood", response_model=Dict[str, int])
async def get_mood_analytics(username: str = Depends(get_current_user)):
    db = get_db()
    cursor = db.memories.find({"username": username})
    
    mood_counts = {"Happy": 0, "Sad": 0, "Neutral": 0, "Stressed": 0}
    
    async for doc in cursor:
        emotion = doc.get("emotion", "Neutral")
        if emotion in mood_counts:
            mood_counts[emotion] += 1
        else:
            mood_counts[emotion] = 1
            
    return mood_counts

@router.get("/timeline", response_model=List[MemoryResponse])
async def get_timeline(username: str = Depends(get_current_user)):
    db = get_db()
    # Simple timeline: all memories sorted by created_at descending
    cursor = db.memories.find({"username": username}).sort("created_at", -1)
    
    memories = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        
        # Don't send embedding to frontend
        if "embedding" in doc:
            del doc["embedding"]
            
        memories.append(MemoryResponse(**doc))
        
    return memories
