from fastapi import APIRouter, HTTPException, Depends
from models import ChatRequest, ChatResponse
from utils.security import get_current_user
from database import get_db
from utils.ai import get_embedding, compute_cosine_similarity
from typing import List

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat_with_ai(chat_req: ChatRequest, username: str = Depends(get_current_user)):
    db = get_db()
    
    # Simple Retrieval Augmented Generation (RAG)
    # 1. Embed the user's message
    query_embedding = get_embedding(chat_req.message)
    
    # 2. Retrieve top memory for the user
    cursor = db.memories.find({"username": username})
    best_match = None
    highest_score = -1
    
    async for memory in cursor:
        mem_embed = memory.get("embedding")
        if mem_embed:
            score = compute_cosine_similarity(query_embedding, mem_embed)
            if score > highest_score and score > 0.2:  # 0.2 threshold
                highest_score = score
                best_match = memory
                
    # 3. Generate response
    # For MVP without OpenAI key, use template responses based on the retrieved memory's emotion
    if best_match:
        emotion = best_match.get("emotion", "Neutral")
        context = best_match.get("content", "")
        
        reply = f"I notice you're talking about something similar to your past '{emotion}' memory where you mentioned: '{context}'. "
        if emotion == "Sad" or emotion == "Stressed":
            reply += "I'm always here to support you. Do you want to talk more about how that made you feel?"
        elif emotion == "Happy":
            reply += "That sounds like a great moment! How are you feeling right now?"
        else:
            reply += "Tell me more about what's on your mind today."
        
        return ChatResponse(reply=reply, referenced_memory_id=str(best_match["_id"]))
    else:
        return ChatResponse(reply="I'm here to listen. This doesn't remind me of any past memories yet, but I'm learning more about you. How was your day?")
