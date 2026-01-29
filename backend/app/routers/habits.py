from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime, timedelta, date as datetime_date
import hashlib

from app.database import get_db, Habit, CheckIn, Reminder as ReminderModel, User, Category
from app.schemas import (
    HabitCreate, HabitUpdate, HabitResponse, CheckInCreate, CheckInResponse,
    Reminder, CheckInStatus, CategoryResponse
)
from app.routers.auth import get_current_user

router = APIRouter()

def get_current_timestamp():
    return int(datetime.utcnow().timestamp() * 1000)

@router.get("", response_model=List[HabitResponse])
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
        
        # Get reminder
        reminder = None
        if habit.reminder:
            reminder = Reminder(
                time=habit.reminder.time,
                days=habit.reminder.days,
                window=habit.reminder.window,
                is_active=habit.reminder.is_active
            )
        
        # Get category
        category = None
        if habit.category:
            category = CategoryResponse.model_validate(habit.category)

        result.append(HabitResponse(
            id=habit.id,
            title=habit.title,
            days_target=habit.days_target,
            category_id=habit.category_id,
            category=category,
            color=habit.color,
            created_at=habit.created_at,
            check_ins=[CheckInResponse.model_validate(ci) for ci in check_ins],
            reminder=reminder
        ))
    
    return result

@router.post("", response_model=HabitResponse)
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
        color=habit_data.color,
        created_at=get_current_timestamp(),
        updated_at=get_current_timestamp()
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
            window=habit_data.reminder.window,
            is_active=habit_data.reminder.is_active,
            created_at=get_current_timestamp(),
            updated_at=get_current_timestamp()
        )
        db.add(reminder)
    
    db.commit()
    db.refresh(habit)
    
    # Construct response manually to ensure all fields are present
    return HabitResponse(
        id=habit.id,
        title=habit.title,
        days_target=habit.days_target,
        category_id=habit.category_id,
        category=None, # New habit relies on ID, relationship might not be loaded yet
        color=habit.color,
        created_at=habit.created_at,
        check_ins=[],
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
    
    # Get reminder
    reminder = None
    if habit.reminder:
        reminder = Reminder(
            time=habit.reminder.time,
            days=habit.reminder.days,
            window=habit.reminder.window,
            is_active=habit.reminder.is_active
        )
        
    # Get category
    category = None
    if habit.category:
        category = CategoryResponse.model_validate(habit.category)
    
    return HabitResponse(
        id=habit.id,
        title=habit.title,
        days_target=habit.days_target,
        category_id=habit.category_id,
        category=category,
        color=habit.color,
        created_at=habit.created_at,
        check_ins=[CheckInResponse.model_validate(ci) for ci in check_ins],
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
    
    habit.updated_at = get_current_timestamp()

    # Update reminder
    if habit_data.reminder is not None:
        if habit.reminder:
            # Update existing reminder
            habit.reminder.time = habit_data.reminder.time
            habit.reminder.days = habit_data.reminder.days
            habit.reminder.window = habit_data.reminder.window
            habit.reminder.is_active = habit_data.reminder.is_active
            habit.reminder.updated_at = get_current_timestamp()
        else:
            # Create new reminder
            reminder = ReminderModel(
                id=str(uuid.uuid4()),
                habit_id=habit.id,
                time=habit_data.reminder.time,
                days=habit_data.reminder.days,
                window=habit_data.reminder.window,
                is_active=habit_data.reminder.is_active,
                created_at=get_current_timestamp(),
                updated_at=get_current_timestamp()
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
    check_in_ts = check_in_data.check_in_date or get_current_timestamp()
    
    # Since we use timestamps, duplicates are technically exact ms matches.
    # To prevent multiple check-ins per day, we need logic to check if a check-in exists for this "day".
    # Converting TS to date depends on timezone. The User has a timezone field now.
    # For now, let's just check for exact timestamp collision? 
    # Or strict "one per day" rule might be flexible now with detailed check-ins.
    # The requirement didn't specify strict one-per-day enforcement with the new schema, but it's a good habit app practice.
    # However, simpler implementation is allowing multiple or checking exact range if needed.
    # Let's align with the "Enhanced Check-ins" (status, note). Maybe multiple notes per day are allowed?
    # I'll enable multiple per day for now unless it conflicts effectively. If I want to enforce uniqueness, I'd need complex day boundary logic with TZ.
    # I'll rely on client to send unique timestamps.
    
    # Create check-in
    check_in = CheckIn(
        id=str(uuid.uuid4()),
        habit_id=habit_id,
        check_in_date=check_in_ts,
        status=check_in_data.status,
        note=check_in_data.note,
        created_at=get_current_timestamp()
    )
    
    db.add(check_in)
    db.commit()
    db.refresh(check_in)
    
    return CheckInResponse(
        id=check_in.id,
        habit_id=check_in.habit_id,
        check_in_date=check_in.check_in_date,
        status=check_in.status,
        note=check_in.note,
        created_at=check_in.created_at
    )

@router.delete("/{habit_id}/check-in/{check_in_id}")
async def delete_check_in(
    habit_id: str,
    check_in_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a specific check-in by ID"""
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
    
    # Find and delete check-in
    check_in = db.query(CheckIn).filter(
        CheckIn.id == check_in_id,
        CheckIn.habit_id == habit_id
    ).first()
    
    if not check_in:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Check-in not found"
        )
    
    db.delete(check_in)
    db.commit()
    
    return {"message": "Check-in deleted successfully"}

