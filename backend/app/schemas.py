from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class BadgeLevel(str, Enum):
    NOVICE = "novice"
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"
    MASTER = "master"

# Base Models
class HabitBadge(BaseModel):
    level: BadgeLevel
    name: str
    description: str
    icon: str
    days_required: int
    achieved_at: Optional[str] = None

class Reminder(BaseModel):
    time: str  # HH:MM format
    days: List[int]  # Array of day numbers (0-6)
    window: int = 30  # Window in minutes

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
class HabitCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    days_target: int = Field(..., ge=1, le=1000)
    category_id: Optional[str] = None
    color: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')
    reminder: Optional[Reminder] = None

class HabitUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    days_target: Optional[int] = Field(None, ge=1, le=1000)
    category_id: Optional[str] = None
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    reminder: Optional[Reminder] = None

class HabitResponse(BaseModel):
    id: str
    title: str
    days_target: int
    category_id: Optional[str] = None
    badge: Optional[HabitBadge] = None
    color: str
    created_at: str
    check_ins: Dict[str, str] = {}
    reminder: Optional[Reminder] = None
    
    class Config:
        from_attributes = True

class CheckInCreate(BaseModel):
    habit_id: str
    check_in_date: Optional[datetime] = None

class CheckInResponse(BaseModel):
    id: str
    habit_id: str
    check_in_date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: str
    email: str
    display_name: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

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
