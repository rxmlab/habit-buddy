from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from collections import defaultdict

from app.database import get_db, Habit, CheckIn
from app.schemas import StatsResponse, HabitStatsResponse, HabitStats, WeeklyTrend, MonthlyTrend, YearlyTrend
from app.routers.auth import get_current_user

router = APIRouter()

def calculate_streaks(check_ins: List[CheckIn]) -> dict:
    """Calculate current and longest streaks"""
    if not check_ins:
        return {"current": 0, "longest": 0, "total": 0, "breaks": 0}
    
    # Sort check-ins by date
    sorted_check_ins = sorted(check_ins, key=lambda x: x.check_in_date)
    
    current_streak = 0
    longest_streak = 0
    temp_streak = 1
    breaks = 0
    
    # Calculate streaks
    for i in range(1, len(sorted_check_ins)):
        prev_date = sorted_check_ins[i-1].check_in_date.date()
        curr_date = sorted_check_ins[i].check_in_date.date()
        
        if (curr_date - prev_date).days == 1:
            temp_streak += 1
        else:
            longest_streak = max(longest_streak, temp_streak)
            if (curr_date - prev_date).days > 1:
                breaks += 1
            temp_streak = 1
    
    longest_streak = max(longest_streak, temp_streak)
    
    # Calculate current streak
    today = datetime.utcnow().date()
    current_streak = 0
    
    for check_in in reversed(sorted_check_ins):
        check_date = check_in.check_in_date.date()
        if check_date == today or check_date == today - timedelta(days=current_streak):
            current_streak += 1
            today = check_date
        else:
            break
    
    return {
        "current": current_streak,
        "longest": longest_streak,
        "total": len(check_ins),
        "breaks": breaks
    }

def calculate_weekly_trend(check_ins: List[CheckIn]) -> WeeklyTrend:
    """Calculate weekly trend for the last 7 weeks"""
    if not check_ins:
        return WeeklyTrend(labels=[], data=[])
    
    # Group check-ins by week
    weekly_data = defaultdict(int)
    
    for check_in in check_ins:
        # Get the start of the week (Monday)
        check_date = check_in.check_in_date.date()
        week_start = check_date - timedelta(days=check_date.weekday())
        weekly_data[week_start] += 1
    
    # Get last 7 weeks
    today = datetime.utcnow().date()
    current_week_start = today - timedelta(days=today.weekday())
    
    labels = []
    data = []
    
    for i in range(7):
        week_start = current_week_start - timedelta(weeks=i)
        labels.insert(0, week_start.strftime("%m/%d"))
        data.insert(0, weekly_data.get(week_start, 0))
    
    return WeeklyTrend(labels=labels, data=data)

def calculate_monthly_trend(check_ins: List[CheckIn]) -> MonthlyTrend:
    """Calculate monthly trend for the last 12 months"""
    if not check_ins:
        return MonthlyTrend(labels=[], data=[])
    
    # Group check-ins by month
    monthly_data = defaultdict(int)
    
    for check_in in check_ins:
        month_key = check_in.check_in_date.strftime("%Y-%m")
        monthly_data[month_key] += 1
    
    # Get last 12 months
    labels = []
    data = []
    
    for i in range(12):
        date = datetime.utcnow() - timedelta(days=30*i)
        month_key = date.strftime("%Y-%m")
        labels.insert(0, date.strftime("%b %Y"))
        data.insert(0, monthly_data.get(month_key, 0))
    
    return MonthlyTrend(labels=labels, data=data)

def calculate_yearly_trend(check_ins: List[CheckIn]) -> YearlyTrend:
    """Calculate yearly trend for the last 5 years"""
    if not check_ins:
        return YearlyTrend(labels=[], data=[])
    
    # Group check-ins by year
    yearly_data = defaultdict(int)
    
    for check_in in check_ins:
        year = check_in.check_in_date.year
        yearly_data[year] += 1
    
    # Get last 5 years
    labels = []
    data = []
    
    for i in range(5):
        year = datetime.utcnow().year - i
        labels.insert(0, str(year))
        data.insert(0, yearly_data.get(year, 0))
    
    return YearlyTrend(labels=labels, data=data)

@router.get("/overview", response_model=StatsResponse)
async def get_overview_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get overview statistics for all habits"""
    habits = db.query(Habit).filter(Habit.user_id == current_user["uid"]).all()
    
    if not habits:
        return StatsResponse(
            total_completed=0,
            average_completion=0.0,
            best_current_streak=0,
            best_longest_streak=0,
            habits_count=0
        )
    
    total_completed = 0
    total_target = 0
    best_current_streak = 0
    best_longest_streak = 0
    
    for habit in habits:
        check_ins = db.query(CheckIn).filter(CheckIn.habit_id == habit.id).all()
        total_completed += len(check_ins)
        total_target += habit.days_target
        
        streaks = calculate_streaks(check_ins)
        best_current_streak = max(best_current_streak, streaks["current"])
        best_longest_streak = max(best_longest_streak, streaks["longest"])
    
    average_completion = (total_completed / total_target * 100) if total_target > 0 else 0
    
    return StatsResponse(
        total_completed=total_completed,
        average_completion=round(average_completion, 1),
        best_current_streak=best_current_streak,
        best_longest_streak=best_longest_streak,
        habits_count=len(habits)
    )

@router.get("/habit/{habit_id}", response_model=HabitStatsResponse)
async def get_habit_stats(
    habit_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get detailed statistics for a specific habit"""
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == current_user["uid"]
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    check_ins = db.query(CheckIn).filter(CheckIn.habit_id == habit_id).all()
    
    # Calculate stats
    streaks = calculate_streaks(check_ins)
    stats = HabitStats(
        current=streaks["current"],
        longest=streaks["longest"],
        total=streaks["total"],
        breaks=streaks["breaks"]
    )
    
    # Calculate trends
    weekly_trend = calculate_weekly_trend(check_ins)
    monthly_trend = calculate_monthly_trend(check_ins)
    yearly_trend = calculate_yearly_trend(check_ins)
    
    return HabitStatsResponse(
        habit_id=habit.id,
        habit_title=habit.title,
        stats=stats,
        weekly_trend=weekly_trend,
        monthly_trend=monthly_trend,
        yearly_trend=yearly_trend
    )

@router.get("/habits", response_model=List[HabitStatsResponse])
async def get_all_habits_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get statistics for all habits"""
    habits = db.query(Habit).filter(Habit.user_id == current_user["uid"]).all()
    
    result = []
    for habit in habits:
        check_ins = db.query(CheckIn).filter(CheckIn.habit_id == habit.id).all()
        
        # Calculate stats
        streaks = calculate_streaks(check_ins)
        stats = HabitStats(
            current=streaks["current"],
            longest=streaks["longest"],
            total=streaks["total"],
            breaks=streaks["breaks"]
        )
        
        # Calculate trends
        weekly_trend = calculate_weekly_trend(check_ins)
        monthly_trend = calculate_monthly_trend(check_ins)
        yearly_trend = calculate_yearly_trend(check_ins)
        
        result.append(HabitStatsResponse(
            habit_id=habit.id,
            habit_title=habit.title,
            stats=stats,
            weekly_trend=weekly_trend,
            monthly_trend=monthly_trend,
            yearly_trend=yearly_trend
        ))
    
    return result
