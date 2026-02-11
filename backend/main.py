from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routes import submissions
import os

app = FastAPI(title="Prompt Battle API")

# CORS Configuration for LAN access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for LAN event
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure generated_images directory exists
os.makedirs("generated_images", exist_ok=True)

# Serve generated images as static files
app.mount("/images", StaticFiles(directory="generated_images"), name="images")

# Include routers
app.include_router(submissions.router, tags=["submissions"])

@app.get("/")
def read_root():
    return {"message": "Prompt Battle API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
