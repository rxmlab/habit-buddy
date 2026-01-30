from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db, Badge
from app.schemas import Badge as BadgeSchema
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[BadgeSchema])
async def get_badges(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all configured badges (master list).
    """
    badges = db.query(Badge).order_by(Badge.id).all()
    return badges
