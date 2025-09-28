from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL - Use PostgreSQL for production, SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./habitbuddy.db")

# For PostgreSQL on Firebase Functions, we'll use a connection string
if DATABASE_URL.startswith("postgresql"):
    engine = create_engine(DATABASE_URL)
else:
    # SQLite for local development
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)  # Firebase UID
    email = Column(String, unique=True, index=True)
    display_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    habits = relationship("Habit", back_populates="user", cascade="all, delete-orphan")

class Habit(Base):
    __tablename__ = "habits"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    days_target = Column(Integer, nullable=False)
    category_id = Column(String, nullable=True)
    color = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="habits")
    check_ins = relationship("CheckIn", back_populates="habit", cascade="all, delete-orphan")
    reminder = relationship("Reminder", back_populates="habit", uselist=False, cascade="all, delete-orphan")

class CheckIn(Base):
    __tablename__ = "check_ins"
    
    id = Column(String, primary_key=True, index=True)
    habit_id = Column(String, ForeignKey("habits.id"), nullable=False)
    check_in_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    habit = relationship("Habit", back_populates="check_ins")

class Reminder(Base):
    __tablename__ = "reminders"
    
    id = Column(String, primary_key=True, index=True)
    habit_id = Column(String, ForeignKey("habits.id"), nullable=False)
    time = Column(String, nullable=False)  # HH:MM format
    days = Column(JSON, nullable=False)  # Array of day numbers (0-6)
    window = Column(Integer, default=30)  # Window in minutes
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    habit = relationship("Habit", back_populates="reminder")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
