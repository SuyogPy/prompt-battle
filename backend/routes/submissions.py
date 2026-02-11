from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import ImageRound, TextRound
from pydantic import BaseModel
import os
import requests
import base64
import uuid
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

class SubmissionRequest(BaseModel):
    name: str
    prompt: str

class ScoreRequest(BaseModel):
    score: int

@router.post("/submit-image")
def submit_image(request: SubmissionRequest, db: Session = Depends(get_db)):
    # Gemini Image Generation API Call (Imagen 3.0 via REST)
    # Using the standard Imagen 3.0 model name for AI Studio
    url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key={GOOGLE_API_KEY}"
    
    payload = {
        "instances": [
            {
                "prompt": request.prompt
            }
        ],
        "parameters": {
            "sampleCount": 1
        }
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        
        # In Google AI Studio REST, the image is likely in predictions[0][bytesBase64Encoded]
        # Adjusting based on standard Gemini REST API for images
        image_data_base64 = data['predictions'][0]['bytesBase64Encoded']
        image_data = base64.b64decode(image_data_base64)
        
        filename = f"{uuid.uuid4()}.png"
        file_path = f"generated_images/{filename}"
        
        # Ensure directory exists
        os.makedirs("generated_images", exist_ok=True)
        
        with open(file_path, "wb") as f:
            f.write(image_data)
            
        new_submission = ImageRound(
            name=request.name,
            prompt=request.prompt,
            image_path=file_path
        )
        db.add(new_submission)
        db.commit()
        db.refresh(new_submission)
        print(f"DEBUG: Successfully stored image round for {request.name}. ID: {new_submission.id}")
        
        return {"id": str(new_submission.id), "image_path": file_path}
    except Exception as e:
        print(f"Error generating image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit-text")
def submit_text(request: SubmissionRequest, db: Session = Depends(get_db)):
    # Gemini Text Generation API Call
    # Using gemini-1.5-flash-latest for better stability
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GOOGLE_API_KEY}"
    
    payload = {
        "contents": [{
            "parts": [{
                "text": request.prompt
            }]
        }]
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        
        generated_text = data['candidates'][0]['content']['parts'][0]['text']
        
        new_submission = TextRound(
            name=request.name,
            prompt=request.prompt,
            response=generated_text
        )
        db.add(new_submission)
        db.commit()
        db.refresh(new_submission)
        print(f"DEBUG: Successfully stored text round for {request.name}. ID: {new_submission.id}")
        
        return {"id": str(new_submission.id), "response": generated_text}
    except Exception as e:
        print(f"Error generating text: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/image-submissions")
def get_image_submissions(db: Session = Depends(get_db)):
    return db.query(ImageRound).order_by(ImageRound.created_at.desc()).all()

@router.get("/text-submissions")
def get_text_submissions(db: Session = Depends(get_db)):
    return db.query(TextRound).order_by(TextRound.created_at.desc()).all()

@router.put("/score-image/{id}")
def score_image(id: str, request: ScoreRequest, db: Session = Depends(get_db)):
    submission = db.query(ImageRound).filter(ImageRound.id == id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    submission.score = request.score
    db.commit()
    return {"status": "success"}

@router.put("/score-text/{id}")
def score_text(id: str, request: ScoreRequest, db: Session = Depends(get_db)):
    submission = db.query(TextRound).filter(TextRound.id == id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    submission.score = request.score
    db.commit()
    return {"status": "success"}
