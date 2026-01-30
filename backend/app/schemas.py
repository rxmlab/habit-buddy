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

class Badge(BaseModel):
    id: int
    slug: str
    name: str
    description: str
    icon: str
    days_required: int = Field(..., alias="daysRequired")
    next_badge_id: Optional[int] = Field(None, alias="nextBadgeId")

    class Config:
        from_attributes = True
        populate_by_name = True

class UserBadge(BaseModel):
    id: str
    user_id: str
    badge: Badge
    earned_at: int  # Timestamp in ms

class Reminder(BaseModel):
    time: str  # HH:MM format
    days: List[int]  # Array of day numbers (0-6)
    window: int = 30  # Window in minutes
    is_active: bool = Field(True, alias="isActive")

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
    created_at: int = Field(..., alias="createdAt")

    class Config:
        from_attributes = True
        populate_by_name = True

# --- Habit ---
class HabitCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    days_target: int = Field(..., ge=1, le=1000, alias="daysTarget")
    category_id: Optional[str] = Field(None, alias="categoryId")
    color: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')
    reminder: Optional[Reminder] = None

class HabitUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    days_target: Optional[int] = Field(None, ge=1, le=1000, alias="daysTarget")
    category_id: Optional[str] = Field(None, alias="categoryId")
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    reminder: Optional[Reminder] = None

class HabitResponse(BaseModel):
    id: str
    title: str
    days_target: int = Field(..., alias="daysTarget")
    category_id: Optional[str] = Field(None, alias="categoryId")
    category: Optional[CategoryResponse] = None
    badge_id: int = Field(..., alias="badgeId")
    color: str
    current_streak: int = Field(0, alias="currentStreak")
    created_at: int = Field(..., alias="createdAt")
    check_ins: List['CheckInResponse'] = Field([], alias="checkIns") 
    reminder: Optional[Reminder] = None
    
    class Config:
        from_attributes = True
        populate_by_name = True

# --- CheckIn ---
class CheckInCreate(BaseModel):
    habit_id: str = Field(..., alias="habitId")
    check_in_date: int = Field(..., alias="checkInDate") # Timestamp in ms
    status: CheckInStatus = CheckInStatus.COMPLETED
    note: Optional[str] = None

class CheckInResponse(BaseModel):
    id: str
    habit_id: str = Field(..., alias="habitId")
    check_in_date: int = Field(..., alias="checkInDate")
    status: CheckInStatus
    note: Optional[str] = None
    created_at: int = Field(..., alias="createdAt")
    
    class Config:
        from_attributes = True
        populate_by_name = True

# --- User ---
class UserResponse(BaseModel):
    id: str
    email: str
    display_name: Optional[str] = Field(None, alias="displayName")
    avatar_url: Optional[str] = Field(None, alias="avatarUrl")
    timezone: str
    created_at: int = Field(..., alias="createdAt")
    
    class Config:
        from_attributes = True
        populate_by_name = True

class UserUpdate(BaseModel):
    display_name: Optional[str] = Field(None, alias="displayName")
    avatar_url: Optional[str] = Field(None, alias="avatarUrl")
    timezone: Optional[str] = None

class StatsResponse(BaseModel):
    total_completed: int = Field(..., alias="totalCompleted")
    average_completion: float = Field(..., alias="averageCompletion")
    best_current_streak: int = Field(..., alias="bestCurrentStreak")
    best_longest_streak: int = Field(..., alias="bestLongestStreak")
    habits_count: int = Field(..., alias="habitsCount")

    class Config:
        from_attributes = True
        populate_by_name = True

class HabitStatsResponse(BaseModel):
    habit_id: str = Field(..., alias="habitId")
    habit_title: str = Field(..., alias="habitTitle")
    stats: HabitStats
    weekly_trend: WeeklyTrend = Field(..., alias="weeklyTrend")
    monthly_trend: MonthlyTrend = Field(..., alias="monthlyTrend")
    yearly_trend: YearlyTrend = Field(..., alias="yearlyTrend")

    class Config:
        from_attributes = True
        populate_by_name = True

# Error Models
class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
