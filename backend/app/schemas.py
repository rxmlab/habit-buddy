from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

# Enums
class BadgeLevel(str, Enum):
    NOVICE = "novice"
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"
    MASTER = "master"

class CheckInStatus(str, Enum):
    COMPLETED = "completed"
    SKIPPED = "skipped"
    FAILED = "failed"

# Base Models
class HabitBadge(BaseModel):
    level: BadgeLevel
    name: str
    description: str
    icon: str
    days_required: int
    achieved_at: Optional[str] = None

class Badge(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    criteria: Dict[str, Any]

class UserBadge(BaseModel):
    id: str
    user_id: str
    badge: Badge
    earned_at: int  # Timestamp in ms

class Reminder(BaseModel):
    time: str  # HH:MM format
    days: List[int]  # Array of day numbers (0-6)
    window: int = 30  # Window in minutes
    is_active: bool = True

class Category(BaseModel):
    id: str
    name: str
    color: str
    icon: Optional[str] = None

class HabitStats(BaseModel):
    current: int
    longest: int
    total: int
    breaks: int

class WeeklyTrend(BaseModel):
    labels: List[str]
    data: List[int]

class MonthlyTrend(BaseModel):
    labels: List[str]
    data: List[int]

class YearlyTrend(BaseModel):
    labels: List[str]
    data: List[int]

# Request/Response Models

# --- Category ---
class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')
    icon: Optional[str] = None

class CategoryResponse(Category):
    created_at: int

    class Config:
        from_attributes = True

# --- Habit ---
class HabitCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    days_target: int = Field(..., ge=1, le=1000, alias="daysTarget")
    category_id: Optional[str] = None
    color: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')
    reminder: Optional[Reminder] = None

class HabitUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    days_target: Optional[int] = Field(None, ge=1, le=1000, alias="daysTarget")
    category_id: Optional[str] = None
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    reminder: Optional[Reminder] = None

class HabitResponse(BaseModel):
    id: str
    title: str
    days_target: int
    category_id: Optional[str] = None
    category: Optional[CategoryResponse] = None
    badge: Optional[HabitBadge] = None
    color: str
    created_at: int
    check_ins: List['CheckInResponse'] = [] 
    reminder: Optional[Reminder] = None
    
    class Config:
        from_attributes = True

# --- CheckIn ---
class CheckInCreate(BaseModel):
    habit_id: str
    check_in_date: int # Timestamp in ms
    status: CheckInStatus = CheckInStatus.COMPLETED
    note: Optional[str] = None

class CheckInResponse(BaseModel):
    id: str
    habit_id: str
    check_in_date: int
    status: CheckInStatus
    note: Optional[str] = None
    created_at: int
    
    class Config:
        from_attributes = True

# --- User ---
class UserResponse(BaseModel):
    id: str
    email: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: str
    created_at: int
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: Optional[str] = None

class StatsResponse(BaseModel):
    total_completed: int
    average_completion: float
    best_current_streak: int
    best_longest_streak: int
    habits_count: int

class HabitStatsResponse(BaseModel):
    habit_id: str
    habit_title: str
    stats: HabitStats
    weekly_trend: WeeklyTrend
    monthly_trend: MonthlyTrend
    yearly_trend: YearlyTrend

# Error Models
class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
