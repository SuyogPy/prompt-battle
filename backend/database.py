import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# explicitly load the .env file from the backend folder
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

# load environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# sanity checks
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found. Check your .env file path or content.")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found. Check your .env file path or content.")

# set up SQLAlchemy engine and session with SSL for Supabase
engine = create_engine(DATABASE_URL, connect_args={"sslmode": "require"})

# Test connection and log errors
try:
    with engine.connect() as connection:
        print("DATABASE DEBUG: Successfully connected to Supabase.")
except Exception as e:
    print(f"DATABASE ERROR: Failed to connect to Supabase. Error: {e}")
    print(f"DATABASE URL USED: {DATABASE_URL.split('@')[0]}@*** (masked)")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
