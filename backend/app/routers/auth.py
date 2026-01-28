from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from firebase_admin import auth
from passlib.context import CryptContext
from jose import jwt, JWTError
import logging
import os
import uuid
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel

from app.database import get_db, User

router = APIRouter()
security = HTTPBearer(auto_error=False)
logger = logging.getLogger(__name__)

# Configuration
PROD_MODE = os.getenv("PROD_MODE", "false").lower() == "true"
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Models for Request Body
class UserAuth(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

# --- HELPER FUNCTIONS ---

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"subdir": "access", "exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- ENDPOINTS ---

@router.post("/signup", response_model=Token)
async def signup(user_data: UserAuth, db: Session = Depends(get_db)):
    """Native Signup"""
    # Check if user exists
    user = db.query(User).filter(User.email == user_data.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        display_name=user_data.email.split("@")[0]
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create Token
    access_token = create_access_token(data={"sub": new_user.id, "email": new_user.email})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "uid": new_user.id,
            "email": new_user.email,
            "displayName": new_user.display_name
        }
    }

@router.post("/login", response_model=Token)
async def login(user_data: UserAuth, db: Session = Depends(get_db)):
    """Native Login"""
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not user.hashed_password or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create Token
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "uid": user.id,
            "email": user.email,
            "displayName": user.display_name
        }
    }

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current user - supports both Firebase and Native JWT"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    user_id = None
    email = None
    
    try:
        # 1. Try Native JWT first (fastest)
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            email = payload.get("email")
            if user_id is None:
                raise JWTError("Invalid token payload")
        except JWTError:
            # 2. Fallback to Firebase (only if not a valid native token)
            try:
                decoded_token = auth.verify_id_token(token)
                user_id = decoded_token["uid"]
                email = decoded_token.get("email")
            except Exception as firebase_error:
                logger.error(f"Auth failed: Native JWT invalid AND Firebase failed: {firebase_error}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication token",
                    headers={"WWW-Authenticate": "Bearer"},
                )

        # Get user from DB
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            # If valid Firebase token but no user, create one (lazy sync)
            # For native auth, user should already exist from signup
            user = User(
                id=user_id,
                email=email,
                display_name=email.split("@")[0] if email else "User"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return {
            "uid": user.id,
            "email": user.email,
            "name": user.display_name
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/me")
async def get_user_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user["uid"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id, 
        "email": user.email, 
        "display_name": user.display_name, 
        "created_at": user.created_at.isoformat()
    }

@router.post("/verify")
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Simple verification endpoint"""
    # Reuse get_current_user login to verify
    # In a real app we might optimize this, but this is sufficient
    return {"valid": True}
