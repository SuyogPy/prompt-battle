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

from openai import OpenAI

load_dotenv()

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize OpenAI client with Groq's base URL
client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

class SubmissionRequest(BaseModel):
    name: str
    prompt: str

    def validate_content(self):
        if not self.name or len(self.name.strip()) < 2:
            raise HTTPException(status_code=400, detail="Name must be at least 2 characters long.")
        if not self.prompt or len(self.prompt.strip()) < 10:
            raise HTTPException(status_code=400, detail="Prompt must be at least 10 characters long to ensure quality results.")

class ScoreRequest(BaseModel):
    score: int

@router.post("/submit-image")
def submit_image(request: SubmissionRequest, db: Session = Depends(get_db)):
    request.validate_content()
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
    request.validate_content()
    # Groq Text Generation (OpenAI-compatible)
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a creative assistant for a Prompt Battle event. Keep responses concise but impressive."},
                {"role": "user", "content": request.prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        generated_text = completion.choices[0].message.content
        
        new_submission = TextRound(
            name=request.name,
            prompt=request.prompt,
            response=generated_text
        )
        db.add(new_submission)
        db.commit()
        db.refresh(new_submission)
        print(f"DEBUG: Successfully stored text round (Groq) for {request.name}. ID: {new_submission.id}")
        
        return {"id": str(new_submission.id), "response": generated_text}
    except Exception as e:
        print(f"DEBUG Error generating text with Groq: {e}")
        raise HTTPException(status_code=500, detail=str(f"Text API Error: {str(e)}"))

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
