from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import firebase_admin
from firebase_admin import auth
import logging

from app.database import get_db, User

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current user from Firebase token"""
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        
        # Get or create user in database
        user_id = decoded_token["uid"]
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            # Create new user
            user = User(
                id=user_id,
                email=decoded_token.get("email", ""),
                display_name=decoded_token.get("name", "")
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Created new user: {user_id}")
        else:
            # Update user info if needed
            if decoded_token.get("email") and user.email != decoded_token["email"]:
                user.email = decoded_token["email"]
            if decoded_token.get("name") and user.display_name != decoded_token["name"]:
                user.display_name = decoded_token["name"]
            db.commit()
        
        return decoded_token
        
    except Exception as e:
        logger.error(f"Authentication failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/me")
async def get_user_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user profile"""
    user = db.query(User).filter(User.id == current_user["uid"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "created_at": user.created_at.isoformat()
    }

@router.post("/verify")
async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Verify Firebase token"""
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return {
            "valid": True,
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name")
        }
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
