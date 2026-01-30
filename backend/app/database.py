from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text, Boolean, ForeignKey, JSON, BigInteger, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL - PostgreSQL is required for this project.
# Expect an environment variable DATABASE_URL like:
# postgresql://username:password@host:port/database_name
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. HabitBuddy requires a PostgreSQL DATABASE_URL, e.g. 'postgresql://user:pass@localhost:5432/habitbuddy'"
    )

if not DATABASE_URL.startswith("postgresql"):
    raise RuntimeError(
        "DATABASE_URL must be a PostgreSQL URL (start with 'postgresql://'). Current value: %r" % DATABASE_URL
    )

# Create SQLAlchemy engine for PostgreSQL
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)  # Firebase UID
    email = Column(String, unique=True, index=True)
    display_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)  # For native auth
    avatar_url = Column(String, nullable=True)
    timezone = Column(String, default="UTC")
    created_at = Column(BigInteger, default=lambda: int(datetime.utcnow().timestamp() * 1000))
    updated_at = Column(BigInteger, default=lambda: int(datetime.utcnow().timestamp() * 1000), onupdate=lambda: int(datetime.utcnow().timestamp() * 1000))
    
    # Relationships
    habits = relationship("Habit", back_populates="user", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True) # Nullable for global categories if needed
    name = Column(String, nullable=False)
    color = Column(String, nullable=False)
    icon = Column(String, nullable=True)
    created_at = Column(BigInteger, default=lambda: int(datetime.utcnow().timestamp() * 1000))
    
    # Relationships
    user = relationship("User", back_populates="categories")
    habits = relationship("Habit", back_populates="category")

class Habit(Base):
    __tablename__ = "habits"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    category_id = Column(String, ForeignKey("categories.id"), nullable=True)
    title = Column(String, nullable=False)
    days_target = Column(Integer, nullable=False)
    color = Column(String, nullable=False)
    created_at = Column(BigInteger, default=lambda: int(datetime.utcnow().timestamp() * 1000))
    updated_at = Column(BigInteger, default=lambda: int(datetime.utcnow().timestamp() * 1000), onupdate=lambda: int(datetime.utcnow().timestamp() * 1000))
    
    # Relationships
    user = relationship("User", back_populates="habits")
    category = relationship("Category", back_populates="habits")
    check_ins = relationship("CheckIn", back_populates="habit", cascade="all, delete-orphan")
    reminder = relationship("Reminder", back_populates="habit", uselist=False, cascade="all, delete-orphan")

class CheckIn(Base):
    __tablename__ = "check_ins"
    
    id = Column(String, primary_key=True, index=True)
    habit_id = Column(String, ForeignKey("habits.id"), nullable=False)
    check_in_date = Column(BigInteger, nullable=False) # Milliseconds timestamp
    status = Column(Enum('completed', 'skipped', 'failed', name='checkinstatus'), default='completed')
    note = Column(Text, nullable=True)
    created_at = Column(BigInteger, default=lambda: int(datetime.utcnow().timestamp() * 1000))
    
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
    created_at = Column(BigInteger, default=lambda: int(datetime.utcnow().timestamp() * 1000))
    updated_at = Column(BigInteger, default=lambda: int(datetime.utcnow().timestamp() * 1000), onupdate=lambda: int(datetime.utcnow().timestamp() * 1000))
    
    # Relationships
    habit = relationship("Habit", back_populates="reminder")

class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    days_required = Column(Integer, nullable=False)
    next_badge_id = Column(Integer, ForeignKey("badges.id"), nullable=True)
    
    # Relationships
    user_badges = relationship("UserBadge", back_populates="badge")
    next_badge = relationship("Badge", remote_side=[id])

class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=False)
    earned_at = Column(BigInteger, default=lambda: int(datetime.utcnow().timestamp() * 1000))

    # Relationships
    user = relationship("User", back_populates="badges")
    badge = relationship("Badge", back_populates="user_badges")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
