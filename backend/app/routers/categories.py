from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from app.database import get_db, Category, Habit
from app.schemas import CategoryCreate, CategoryResponse
from app.routers.auth import get_current_user

router = APIRouter()

def get_current_timestamp():
    return int(datetime.utcnow().timestamp() * 1000)

@router.get("", response_model=List[CategoryResponse])
async def get_categories(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all categories for the current user (and global ones if implemented)"""
    # Assuming categories are per user for now based on implementation plan
    categories = db.query(Category).filter(
        (Category.user_id == current_user["uid"]) | (Category.user_id.is_(None))
    ).all()
    
    return [CategoryResponse.model_validate(c) for c in categories]

@router.post("", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new category"""
    # Check for existing category with same name for user
    existing = db.query(Category).filter(
        Category.user_id == current_user["uid"],
        Category.name == category_data.name
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    
    category = Category(
        id=str(uuid.uuid4()),
        user_id=current_user["uid"],
        name=category_data.name,
        color=category_data.color,
        icon=category_data.icon,
        created_at=get_current_timestamp()
    )
    
    db.add(category)
    db.commit()
    db.refresh(category)
    
    return CategoryResponse.model_validate(category)

@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a category"""
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user["uid"]
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if used by any habits
    habits_count = db.query(Habit).filter(Habit.category_id == category_id).count()
    if habits_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category used by {habits_count} habits"
        )
    
    db.delete(category)
    db.commit()
    
    return {"message": "Category deleted successfully"}
