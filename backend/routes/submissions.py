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
    # Pollinations.ai Image Generation (Free, No API Key)
    import random
    from urllib.parse import quote
    
    seed = random.randint(0, 1000000)
    prompt_encoded = quote(request.prompt)
    # Using image.pollinations.ai which is more reliable for direct requests
    url = f"https://image.pollinations.ai/prompt/{prompt_encoded}?width=1024&height=1024&seed={seed}&model=flux&nologo=true"
    
    try:
        print(f"DEBUG: Requesting image from Pollinations: {url}")
        response = requests.get(url)
        response.raise_for_status()
        
        image_data = response.content
        filename = f"{uuid.uuid4()}.png"
        file_path = f"generated_images/{filename}"
        
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
        print(f"DEBUG: Successfully stored image round (Pollinations) for {request.name}. ID: {new_submission.id}")
        
        return {"id": str(new_submission.id), "image_path": file_path}
    except Exception as e:
        print(f"DEBUG Error generating image with Pollinations: {e}")
        raise HTTPException(status_code=500, detail=str(f"Image API Error: {str(e)}"))

@router.post("/submit-text")
def submit_text(request: SubmissionRequest, db: Session = Depends(get_db)):
    # Gemini Text Generation API Call
    # Using gemini-2.0-flash as gemini-1.5-flash was not in the available models list
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GOOGLE_API_KEY}"
    
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
        print(f"DEBUG Error generating text: {e}")
        if hasattr(e, 'response') and e.response is not None:
             print(f"DEBUG API Response Body: {e.response.text}")
        raise HTTPException(status_code=500, detail=str(f"API Error: {str(e)}"))

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
