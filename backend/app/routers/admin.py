from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import logging

from app.database import get_db, User, Habit, CheckIn
from app.routers.auth import get_current_admin

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/dashboard")
async def get_admin_dashboard(
    admin_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get insights and statistics for the admin dashboard"""
    try:
        # Get total users
        total_users = db.query(func.count(User.id)).scalar() or 0
        
        # Get new users in last 7 days
        seven_days_ago = int((datetime.utcnow() - timedelta(days=7)).timestamp() * 1000)
        new_users_7d = db.query(func.count(User.id)).filter(User.created_at >= seven_days_ago).scalar() or 0
        
        # Get total habits
        total_habits = db.query(func.count(Habit.id)).scalar() or 0
        
        # Get total check-ins
        total_checkins = db.query(func.count(CheckIn.id)).scalar() or 0
        
        # Optional: recent users
        recent_users_query = db.query(User).order_by(User.created_at.desc()).limit(5).all()
        recent_users = [
            {
                "id": u.id,
                "email": u.email,
                "display_name": u.display_name,
                "created_at": u.created_at
            }
            for u in recent_users_query
        ]

        return {
            "total_users": total_users,
            "new_users_7d": new_users_7d,
            "total_habits": total_habits,
            "total_checkins": total_checkins,
            "recent_users": recent_users
        }
    except Exception as e:
        logger.error(f"Error fetching admin dashboard stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch dashboard statistics"
        )
