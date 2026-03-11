from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, memories, ai_chat, analytics, goals

app = FastAPI(title="AI Memory Companion API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(memories.router, prefix="/api/memories", tags=["memories"])
app.include_router(ai_chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(goals.router, prefix="/api/goals", tags=["goals"])

@app.get("/")
def read_root():
    return {"status": "ok", "message": "AI Memory Companion API is running"}
