from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import uuid
import shutil

router = APIRouter()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    # Check if image or video
    allowed_images = ["image/jpeg", "image/png", "image/gif"]
    allowed_videos = ["video/mp4", "video/webm"]
    
    file_type = None
    if file.content_type in allowed_images:
        file_type = "image"
    elif file.content_type in allowed_videos:
        file_type = "video"
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Only images and MP4/WebM videos are allowed.")
    
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {
        "url": f"/uploads/{file_name}",
        "type": file_type
    }
