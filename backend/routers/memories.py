from fastapi import APIRouter, HTTPException, Depends
from models import MemoryCreate, MemoryResponse
from utils.security import get_current_user
from database import get_db
from bson import ObjectId
from datetime import datetime
from typing import List
from utils.ai import analyze_emotion, get_embedding

router = APIRouter()

@router.post("/", response_model=MemoryResponse)
async def create_memory(memory: MemoryCreate, username: str = Depends(get_current_user)):
    db = get_db()
    memory_dict = memory.model_dump()
    memory_dict["username"] = username
    memory_dict["created_at"] = datetime.utcnow().isoformat()
    
    # AI auto-tagging
    if not memory_dict.get("emotion"):
        memory_dict["emotion"] = analyze_emotion(memory.content)
        
    # Generate NLP search embedding vectors
    memory_dict["embedding"] = get_embedding(memory.content)

    result = await db.memories.insert_one(memory_dict)
    
    # We do not return embedding to front-end to save bandwidth
    return_dict = {k:v for k,v in memory_dict.items() if k != "embedding"}
    
    return MemoryResponse(
        id=str(result.inserted_id),
        **return_dict
    )

@router.get("/", response_model=List[MemoryResponse])
async def get_memories(username: str = Depends(get_current_user)):
    db = get_db()
    cursor = db.memories.find({"username": username}).sort("created_at", -1)
    memories = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        memories.append(MemoryResponse(**doc))
    return memories

@router.delete("/{memory_id}")
async def delete_memory(memory_id: str, username: str = Depends(get_current_user)):
    db = get_db()
    result = await db.memories.delete_one({"_id": ObjectId(memory_id), "username": username})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Memory not found or not authorized")
    return {"status": "success", "message": "Memory deleted"}

@router.get("/search", response_model=List[MemoryResponse])
async def search_memories(query: str, username: str = Depends(get_current_user)):
    from utils.ai import get_embedding, compute_cosine_similarity
    db = get_db()
    query_embed = get_embedding(query)
    
    cursor = db.memories.find({"username": username})
    matches = []
    
    async for doc in cursor:
        mem_embed = doc.get("embedding")
        if mem_embed:
            score = compute_cosine_similarity(query_embed, mem_embed)
            if score > 0.15: # Lowered threshold for semantic recall
                doc["score"] = float(score)
                doc["id"] = str(doc["_id"])
                matches.append(doc)
                
    # Sort by descending similarity score
    matches.sort(key=lambda x: x["score"], reverse=True)
    
    # Remove embedding before returning
    for m in matches:
        if "embedding" in m:
            del m["embedding"]
            
    return [MemoryResponse(**m) for m in matches]
