from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from app.database import get_db, Habit, Reminder as ReminderModel
from app.schemas import Reminder
from app.routers.auth import get_current_user

router = APIRouter()

def get_current_timestamp():
    return int(datetime.utcnow().timestamp() * 1000)

@router.get("", response_model=List[dict])
async def get_reminders(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all reminders for the current user"""
    habits = db.query(Habit).filter(Habit.user_id == current_user["uid"]).all()
    
    result = []
    for habit in habits:
        if habit.reminder and habit.reminder.is_active:
            result.append({
                "habit_id": habit.id,
                "habit_title": habit.title,
                "reminder": Reminder(
                    time=habit.reminder.time,
                    days=habit.reminder.days,
                    window=habit.reminder.window,
                    is_active=habit.reminder.is_active
                )
            })
    
    return result

@router.get("/{habit_id}", response_model=Reminder)
async def get_habit_reminder(
    habit_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get reminder for a specific habit"""
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user["uid"]
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    if not habit.reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No reminder set for this habit"
        )
    
    return Reminder(
        time=habit.reminder.time,
        days=habit.reminder.days,
        window=habit.reminder.window,
        is_active=habit.reminder.is_active
    )

@router.put("/{habit_id}", response_model=Reminder)
async def update_habit_reminder(
    habit_id: str,
    reminder_data: Reminder,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update reminder for a specific habit"""
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user["uid"]
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    if habit.reminder:
        # Update existing reminder
        habit.reminder.time = reminder_data.time
        habit.reminder.days = reminder_data.days
        habit.reminder.window = reminder_data.window
        habit.reminder.is_active = True
        habit.reminder.updated_at = get_current_timestamp()
    else:
        # Create new reminder
        reminder = ReminderModel(
            id=str(uuid.uuid4()),
            habit_id=habit_id,
            time=reminder_data.time,
            days=reminder_data.days,
            window=reminder_data.window,
            is_active=True,
            created_at=get_current_timestamp(),
            updated_at=get_current_timestamp()
        )
        db.add(reminder)
    
    db.commit()
    
    return reminder_data

@router.delete("/{habit_id}")
async def delete_habit_reminder(
    habit_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete reminder for a specific habit"""
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user["uid"]
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    if not habit.reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No reminder set for this habit"
        )
    
    db.delete(habit.reminder)
    db.commit()
    
    return {"message": "Reminder deleted successfully"}

@router.post("/{habit_id}/toggle")
async def toggle_reminder(
    habit_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Toggle reminder active status"""
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user["uid"]
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    if not habit.reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No reminder set for this habit"
        )
    
    habit.reminder.is_active = not habit.reminder.is_active
    habit.reminder.updated_at = get_current_timestamp()
    db.commit()
    
    return {
        "message": f"Reminder {'activated' if habit.reminder.is_active else 'deactivated'}",
        "is_active": habit.reminder.is_active
    }