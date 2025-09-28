from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import hashlib

from app.database import get_db, Habit, CheckIn, Reminder as ReminderModel, User
from app.schemas import (
    HabitCreate, HabitUpdate, HabitResponse, CheckInCreate, CheckInResponse,
    HabitBadge, BadgeLevel, Reminder
)
from app.routers.auth import get_current_user

router = APIRouter()

# Badge configuration matching Angular frontend
BADGE_LEVELS = {
    BadgeLevel.NOVICE: {"days": 7, "name": "Novice", "icon": "🌱"},
    BadgeLevel.BEGINNER: {"days": 21, "name": "Beginner", "icon": "🌿"},
    BadgeLevel.INTERMEDIATE: {"days": 50, "name": "Intermediate", "icon": "🌳"},
    BadgeLevel.ADVANCED: {"days": 100, "name": "Advanced", "icon": "🏆"},
    BadgeLevel.EXPERT: {"days": 200, "name": "Expert", "icon": "👑"},
    BadgeLevel.MASTER: {"days": 365, "name": "Master", "icon": "🌟"}
}

def calculate_badge(completed_days: int) -> Optional[HabitBadge]:
    """Calculate badge based on completed days"""
    for level in [BadgeLevel.MASTER, BadgeLevel.EXPERT, BadgeLevel.ADVANCED, 
                  BadgeLevel.INTERMEDIATE, BadgeLevel.BEGINNER, BadgeLevel.NOVICE]:
        config = BADGE_LEVELS[level]
        if completed_days >= config["days"]:
            return HabitBadge(
                level=level,
                name=config["name"],
                description=f"Completed {config['days']}+ days",
                icon=config["icon"],
                days_required=config["days"],
                achieved_at=datetime.utcnow().isoformat()
            )
    return None

def generate_check_in_hash(habit_id: str, date: str) -> str:
    """Generate a hash for check-in verification"""
    return hashlib.md5(f"{habit_id}_{date}".encode()).hexdigest()

@router.get("/", response_model=List[HabitResponse])
async def get_habits(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all habits for the current user"""
    habits = db.query(Habit).filter(Habit.user_id == current_user["uid"]).all()
    
    result = []
    for habit in habits:
        # Get check-ins for this habit
        check_ins = db.query(CheckIn).filter(CheckIn.habit_id == habit.id).all()
        check_ins_dict = {}
        
        for check_in in check_ins:
            date_str = check_in.check_in_date.strftime("%Y-%m-%d")
            check_ins_dict[date_str] = generate_check_in_hash(habit.id, date_str)
        
        # Calculate badge
        completed_days = len(check_ins)
        badge = calculate_badge(completed_days)
        
        # Get reminder
        reminder = None
        if habit.reminder:
            reminder = Reminder(
                time=habit.reminder.time,
                days=habit.reminder.days,
                window=habit.reminder.window
            )
        
        result.append(HabitResponse(
            id=habit.id,
            title=habit.title,
            days_target=habit.days_target,
            category_id=habit.category_id,
            badge=badge,
            color=habit.color,
            created_at=habit.created_at.isoformat(),
            check_ins=check_ins_dict,
            reminder=reminder
        ))
    
    return result

@router.post("/", response_model=HabitResponse)
async def create_habit(
    habit_data: HabitCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new habit"""
    # Create habit
    habit = Habit(
        id=str(uuid.uuid4()),
        user_id=current_user["uid"],
        title=habit_data.title,
        days_target=habit_data.days_target,
        category_id=habit_data.category_id,
        color=habit_data.color
    )
    
    db.add(habit)
    db.flush()  # Get the ID
    
    # Create reminder if provided
    if habit_data.reminder:
        reminder = ReminderModel(
            id=str(uuid.uuid4()),
            habit_id=habit.id,
            time=habit_data.reminder.time,
            days=habit_data.reminder.days,
            window=habit_data.reminder.window
        )
        db.add(reminder)
    
    db.commit()
    db.refresh(habit)
    
    return HabitResponse(
        id=habit.id,
        title=habit.title,
        days_target=habit.days_target,
        category_id=habit.category_id,
        badge=None,
        color=habit.color,
        created_at=habit.created_at.isoformat(),
        check_ins={},
        reminder=habit_data.reminder
    )

@router.get("/{habit_id}", response_model=HabitResponse)
async def get_habit(
    habit_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific habit"""
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user["uid"]
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    # Get check-ins
    check_ins = db.query(CheckIn).filter(CheckIn.habit_id == habit.id).all()
    check_ins_dict = {}
    
    for check_in in check_ins:
        date_str = check_in.check_in_date.strftime("%Y-%m-%d")
        check_ins_dict[date_str] = generate_check_in_hash(habit.id, date_str)
    
    # Calculate badge
    completed_days = len(check_ins)
    badge = calculate_badge(completed_days)
    
    # Get reminder
    reminder = None
    if habit.reminder:
        reminder = Reminder(
            time=habit.reminder.time,
            days=habit.reminder.days,
            window=habit.reminder.window
        )
    
    return HabitResponse(
        id=habit.id,
        title=habit.title,
        days_target=habit.days_target,
        category_id=habit.category_id,
        badge=badge,
        color=habit.color,
        created_at=habit.created_at.isoformat(),
        check_ins=check_ins_dict,
        reminder=reminder
    )

@router.put("/{habit_id}", response_model=HabitResponse)
async def update_habit(
    habit_id: str,
    habit_data: HabitUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a habit"""
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user["uid"]
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    # Update habit fields
    if habit_data.title is not None:
        habit.title = habit_data.title
    if habit_data.days_target is not None:
        habit.days_target = habit_data.days_target
    if habit_data.category_id is not None:
        habit.category_id = habit_data.category_id
    if habit_data.color is not None:
        habit.color = habit_data.color
    
    # Update reminder
    if habit_data.reminder is not None:
        if habit.reminder:
            # Update existing reminder
            habit.reminder.time = habit_data.reminder.time
            habit.reminder.days = habit_data.reminder.days
            habit.reminder.window = habit_data.reminder.window
        else:
            # Create new reminder
            reminder = ReminderModel(
                id=str(uuid.uuid4()),
                habit_id=habit.id,
                time=habit_data.reminder.time,
                days=habit_data.reminder.days,
                window=habit_data.reminder.window
            )
            db.add(reminder)
    
    db.commit()
    db.refresh(habit)
    
    # Return updated habit
    return await get_habit(habit_id, db, current_user)

@router.delete("/{habit_id}")
async def delete_habit(
    habit_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a habit"""
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user["uid"]
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    db.delete(habit)
    db.commit()
    
    return {"message": "Habit deleted successfully"}

@router.post("/{habit_id}/check-in", response_model=CheckInResponse)
async def check_in_habit(
    habit_id: str,
    check_in_data: CheckInCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Add a check-in for a habit"""
    # Verify habit belongs to user
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user["uid"]
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    # Use provided date or current date
    check_in_date = check_in_data.check_in_date or datetime.utcnow()
    
    # Check if check-in already exists for this date
    existing_check_in = db.query(CheckIn).filter(
        CheckIn.habit_id == habit_id,
        CheckIn.check_in_date.date() == check_in_date.date()
    ).first()
    
    if existing_check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in already exists for this date"
        )
    
    # Create check-in
    check_in = CheckIn(
        id=str(uuid.uuid4()),
        habit_id=habit_id,
        check_in_date=check_in_date
    )
    
    db.add(check_in)
    db.commit()
    db.refresh(check_in)
    
    return CheckInResponse(
        id=check_in.id,
        habit_id=check_in.habit_id,
        check_in_date=check_in.check_in_date,
        created_at=check_in.created_at
    )

@router.delete("/{habit_id}/check-in/{date}")
async def delete_check_in(
    habit_id: str,
    date: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a check-in for a specific date"""
    # Verify habit belongs to user
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user["uid"]
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    # Parse date
    try:
        check_in_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    # Find and delete check-in
    check_in = db.query(CheckIn).filter(
        CheckIn.habit_id == habit_id,
        CheckIn.check_in_date.date() == check_in_date
    ).first()
    
    if not check_in:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Check-in not found"
        )
    
    db.delete(check_in)
    db.commit()
    
    return {"message": "Check-in deleted successfully"}
