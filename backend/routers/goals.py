from fastapi import APIRouter, HTTPException, Depends
from models import GoalCreate, GoalResponse
from utils.security import get_current_user
from database import get_db
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter()

@router.post("/", response_model=GoalResponse)
async def create_goal(goal: GoalCreate, username: str = Depends(get_current_user)):
    db = get_db()
    goal_dict = goal.dict()
    goal_dict.update({
        "username": username,
        "completed": False,
        "created_at": datetime.utcnow().isoformat()
    })
    result = await db.goals.insert_one(goal_dict)
    goal_dict["id"] = str(result.inserted_id)
    return GoalResponse(**goal_dict)

@router.get("/", response_model=List[GoalResponse])
async def get_goals(username: str = Depends(get_current_user)):
    db = get_db()
    cursor = db.goals.find({"username": username})
    goals = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        goals.append(GoalResponse(**doc))
    return goals

@router.patch("/{goal_id}", response_model=GoalResponse)
async def toggle_goal(goal_id: str, username: str = Depends(get_current_user)):
    db = get_db()
    goal = await db.goals.find_one({"_id": ObjectId(goal_id), "username": username})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    new_status = not goal.get("completed", False)
    await db.goals.update_one(
        {"_id": ObjectId(goal_id)},
        {"$set": {"completed": new_status}}
    )
    goal["completed"] = new_status
    goal["id"] = str(goal["_id"])
    return GoalResponse(**goal)
