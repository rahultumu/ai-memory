from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserInDB(BaseModel):
    username: str
    email: EmailStr
    hashed_password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class MemoryCreate(BaseModel):
    content: str
    emotion: Optional[str] = None
    tags: Optional[list[str]] = []
    
class MemoryResponse(BaseModel):
    id: str
    username: str
    content: str
    emotion: Optional[str] = None
    tags: Optional[list[str]] = []
    created_at: str

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    referenced_memory_id: Optional[str] = None

class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    target_date: Optional[str] = None

class GoalResponse(BaseModel):
    id: str
    username: str
    title: str
    description: Optional[str] = None
    target_date: Optional[str] = None
    completed: bool = False
    created_at: str
