from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from .database import Base

class ImageRound(Base):
    __tablename__ = "image_round"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    prompt = Column(String, nullable=False)
    image_path = Column(String, nullable=False)
    score = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TextRound(Base):
    __tablename__ = "text_round"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    prompt = Column(String, nullable=False)
    response = Column(Text, nullable=False)
    score = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
