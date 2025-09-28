from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import firebase_admin
from firebase_admin import auth, credentials, firestore
import os
from dotenv import load_dotenv
import asyncio
import uvicorn
from starlette.responses import JSONResponse
import json

# Load environment variables
load_dotenv()

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    try:
        # Try to initialize with service account key from environment
        service_account_key = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
        if service_account_key:
            # Parse the JSON string from environment variable
            import json
            service_account_info = json.loads(service_account_key)
            cred = credentials.Certificate(service_account_info)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized successfully with service account")
        else:
            # Try default initialization (for local development)
            firebase_admin.initialize_app()
            print("Firebase Admin SDK initialized successfully with default credentials")
    except Exception as e:
        print(f"Firebase initialization error: {e}")
        print("Continuing without Firebase - some features may not work")

# Initialize Firestore
try:
    db = firestore.client()
    print("Firestore client initialized successfully")
except Exception as e:
    print(f"Firestore initialization error: {e}")
    db = None

# Pydantic Models
class HabitBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    daysTarget: int = Field(..., ge=1, le=365)
    categoryId: Optional[str] = None
    color: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')
    reminder: Optional[Dict[str, Any]] = None

class HabitCreate(HabitBase):
    pass

class HabitUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    daysTarget: Optional[int] = Field(None, ge=1, le=365)
    categoryId: Optional[str] = None
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    reminder: Optional[Dict[str, Any]] = None

class HabitResponse(HabitBase):
    id: str
    createdAt: str
    checkIns: Dict[str, str] = {}
    badge: Optional[Dict[str, Any]] = None

class CheckInRequest(BaseModel):
    habit_id: str
    check_in_date: Optional[str] = None

# Create FastAPI app
app = FastAPI(
    title="HabitBuddy API",
    description="Backend API for HabitBuddy habit tracking application with Firestore integration",
    version="1.0.0"
)

# Configure CORS for Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",  # Angular dev server
        "https://abhyatus.web.app",  # Firebase hosting
        "https://abhyatus.firebaseapp.com",  # Firebase hosting alt
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication dependency
async def get_current_user(authorization: Optional[str] = None):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "habitbuddy-api", "mode": "vercel"}

# Root endpoint
@app.get("/")
async def root():
    return {"message": "HabitBuddy API", "version": "1.0.0", "deployment": "vercel"}

# Simple test endpoint
@app.get("/api/test")
async def test_endpoint():
    return {"message": "API is working!", "timestamp": "2024-01-01T00:00:00Z"}

# Get all habits for authenticated user
@app.get("/api/habits", response_model=List[HabitResponse])
async def get_habits(current_user: dict = Depends(get_current_user)):
    """Get all habits for the authenticated user from Firestore"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        user_id = current_user["uid"]
        habits_ref = db.collection('users').document(user_id).collection('habits')
        docs = habits_ref.stream()
        
        habits = []
        for doc in docs:
            data = doc.to_dict()
            habits.append(HabitResponse(
                id=doc.id,
                title=data.get('title', ''),
                daysTarget=data.get('daysTarget', 30),
                categoryId=data.get('categoryId'),
                color=data.get('color', '#3b82f6'),
                createdAt=data.get('createdAt', datetime.utcnow().isoformat()),
                checkIns=data.get('checkIns', {}),
                reminder=data.get('reminder'),
                badge=data.get('badge')
            ))
        
        return habits
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching habits: {str(e)}")

# Create habit endpoint
@app.post("/api/habits", response_model=HabitResponse)
async def create_habit(habit_data: HabitCreate, current_user: dict = Depends(get_current_user)):
    """Create a new habit for the authenticated user in Firestore"""
    try:
        user_id = current_user["uid"]
        habits_ref = db.collection('users').document(user_id).collection('habits')
        
        habit_doc = {
            'title': habit_data.title,
            'daysTarget': habit_data.daysTarget,
            'categoryId': habit_data.categoryId,
            'color': habit_data.color,
            'createdAt': datetime.utcnow().isoformat(),
            'checkIns': {},
            'reminder': habit_data.reminder,
            'badge': None
        }
        
        doc_ref = habits_ref.add(habit_doc)
        habit_doc['id'] = doc_ref[1].id
        
        return HabitResponse(**habit_doc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating habit: {str(e)}")

# Check-in endpoint
@app.post("/api/habits/{habit_id}/check-in")
async def check_in_habit(habit_id: str, check_in_data: CheckInRequest, current_user: dict = Depends(get_current_user)):
    """Add a check-in for a specific habit in Firestore"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        user_id = current_user["uid"]
        habit_ref = db.collection('users').document(user_id).collection('habits').document(habit_id)
        
        # Get current habit data
        habit_doc = habit_ref.get()
        if not habit_doc.exists:
            raise HTTPException(status_code=404, detail="Habit not found")
        
        habit_data = habit_doc.to_dict()
        check_ins = habit_data.get('checkIns', {})
        
        # Add check-in
        check_in_date = check_in_data.check_in_date or datetime.utcnow().strftime("%Y-%m-%d")
        check_ins[check_in_date] = datetime.utcnow().isoformat()
        
        # Update habit with new check-in
        habit_ref.update({'checkIns': check_ins})
        
        return {
            "message": "Check-in added successfully",
            "habit_id": habit_id,
            "date": check_in_date
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding check-in: {str(e)}")

# Additional endpoints for complete API
@app.get("/api/habits/{habit_id}", response_model=HabitResponse)
async def get_habit(
    habit_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific habit by ID"""
    try:
        user_id = current_user["uid"]
        habit_ref = db.collection('users').document(user_id).collection('habits').document(habit_id)
        habit_doc = habit_ref.get()
        
        if not habit_doc.exists:
            raise HTTPException(status_code=404, detail="Habit not found")
        
        data = habit_doc.to_dict()
        return HabitResponse(
            id=habit_doc.id,
            title=data.get('title', ''),
            daysTarget=data.get('daysTarget', 30),
            categoryId=data.get('categoryId'),
            color=data.get('color', '#3b82f6'),
            createdAt=data.get('createdAt', datetime.utcnow().isoformat()),
            checkIns=data.get('checkIns', {}),
            reminder=data.get('reminder'),
            badge=data.get('badge')
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching habit: {str(e)}")

@app.put("/api/habits/{habit_id}", response_model=HabitResponse)
async def update_habit(
    habit_id: str,
    habit_data: HabitUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a specific habit"""
    try:
        user_id = current_user["uid"]
        habit_ref = db.collection('users').document(user_id).collection('habits').document(habit_id)
        
        # Get current habit data
        habit_doc = habit_ref.get()
        if not habit_doc.exists:
            raise HTTPException(status_code=404, detail="Habit not found")
        
        current_data = habit_doc.to_dict()
        
        # Update only provided fields
        update_data = {}
        if habit_data.title is not None:
            update_data['title'] = habit_data.title
        if habit_data.daysTarget is not None:
            update_data['daysTarget'] = habit_data.daysTarget
        if habit_data.categoryId is not None:
            update_data['categoryId'] = habit_data.categoryId
        if habit_data.color is not None:
            update_data['color'] = habit_data.color
        if habit_data.reminder is not None:
            update_data['reminder'] = habit_data.reminder
        
        habit_ref.update(update_data)
        
        # Return updated habit
        updated_data = {**current_data, **update_data}
        return HabitResponse(
            id=habit_doc.id,
            title=updated_data.get('title', ''),
            daysTarget=updated_data.get('daysTarget', 30),
            categoryId=updated_data.get('categoryId'),
            color=updated_data.get('color', '#3b82f6'),
            createdAt=updated_data.get('createdAt', datetime.utcnow().isoformat()),
            checkIns=updated_data.get('checkIns', {}),
            reminder=updated_data.get('reminder'),
            badge=updated_data.get('badge')
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating habit: {str(e)}")

@app.delete("/api/habits/{habit_id}", response_model=Dict[str, str])
async def delete_habit(
    habit_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a specific habit"""
    try:
        user_id = current_user["uid"]
        habit_ref = db.collection('users').document(user_id).collection('habits').document(habit_id)
        
        # Check if habit exists
        habit_doc = habit_ref.get()
        if not habit_doc.exists:
            raise HTTPException(status_code=404, detail="Habit not found")
        
        habit_ref.delete()
        return {"message": f"Habit {habit_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting habit: {str(e)}")

@app.delete("/api/habits/{habit_id}/check-in/{date}", response_model=Dict[str, str])
async def remove_check_in(
    habit_id: str,
    date: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove a check-in for a specific habit and date"""
    try:
        user_id = current_user["uid"]
        habit_ref = db.collection('users').document(user_id).collection('habits').document(habit_id)
        
        # Get current habit data
        habit_doc = habit_ref.get()
        if not habit_doc.exists:
            raise HTTPException(status_code=404, detail="Habit not found")
        
        habit_data = habit_doc.to_dict()
        check_ins = habit_data.get('checkIns', {})
        
        # Remove check-in
        if date in check_ins:
            del check_ins[date]
            habit_ref.update({'checkIns': check_ins})
            return {"message": f"Check-in for {date} removed successfully"}
        else:
            raise HTTPException(status_code=404, detail="Check-in not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing check-in: {str(e)}")

@app.get("/api/habits/stats", response_model=Dict[str, Any])
async def get_habit_stats(current_user: dict = Depends(get_current_user)):
    """Get habit statistics for the authenticated user"""
    try:
        user_id = current_user["uid"]
        habits_ref = db.collection('users').document(user_id).collection('habits')
        docs = habits_ref.stream()
        
        habits = []
        for doc in docs:
            data = doc.to_dict()
            habits.append({
                'id': doc.id,
                'checkIns': data.get('checkIns', {}),
                'daysTarget': data.get('daysTarget', 30)
            })
        
        # Calculate statistics
        total_habits = len(habits)
        today = datetime.utcnow().strftime("%Y-%m-%d")
        completed_today = sum(1 for habit in habits if habit['checkIns'].get(today))
        
        # Calculate streaks
        current_streaks = []
        longest_streaks = []
        
        for habit in habits:
            check_ins = habit['checkIns']
            if not check_ins:
                current_streaks.append(0)
                longest_streaks.append(0)
                continue
            
            sorted_dates = sorted(check_ins.keys())
            current_streak = 0
            longest_streak = 0
            temp_streak = 1
            
            for i in range(1, len(sorted_dates)):
                prev_date = datetime.strptime(sorted_dates[i-1], "%Y-%m-%d")
                curr_date = datetime.strptime(sorted_dates[i], "%Y-%m-%d")
                diff = (curr_date - prev_date).days
                
                if diff == 1:
                    temp_streak += 1
                else:
                    longest_streak = max(longest_streak, temp_streak)
                    temp_streak = 1
            
            longest_streak = max(longest_streak, temp_streak)
            
            # Current streak
            if today in check_ins:
                current_streak = temp_streak
            else:
                yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
                if yesterday in check_ins:
                    current_streak = temp_streak
                else:
                    current_streak = 0
            
            current_streaks.append(current_streak)
            longest_streaks.append(longest_streak)
        
        current_streak = max(current_streaks) if current_streaks else 0
        longest_streak = max(longest_streaks) if longest_streaks else 0
        
        # Average completion
        total_completion = sum(
            len(habit['checkIns']) / habit['daysTarget'] * 100 
            for habit in habits if habit['daysTarget'] > 0
        )
        average_completion = total_completion / total_habits if total_habits > 0 else 0
        
        return {
            "totalHabits": total_habits,
            "completedToday": completed_today,
            "currentStreak": current_streak,
            "longestStreak": longest_streak,
            "averageCompletion": round(average_completion, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating stats: {str(e)}")

# Trend endpoints
@app.get("/api/trends/weekly", response_model=Dict[str, Any])
async def get_weekly_trend(current_user: dict = Depends(get_current_user)):
    """Get weekly trend data"""
    try:
        user_id = current_user["uid"]
        habits_ref = db.collection('users').document(user_id).collection('habits')
        docs = habits_ref.stream()
        
        # Get last 7 days
        labels = []
        data = []
        
        for i in range(6, -1, -1):
            date = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
            labels.append(date)
            
            # Count check-ins for this date
            count = 0
            for doc in docs:
                habit_data = doc.to_dict()
                check_ins = habit_data.get('checkIns', {})
                if date in check_ins:
                    count += 1
        
        return {"labels": labels, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting weekly trend: {str(e)}")

@app.get("/api/trends/monthly", response_model=Dict[str, Any])
async def get_monthly_trend(current_user: dict = Depends(get_current_user)):
    """Get monthly trend data"""
    try:
        user_id = current_user["uid"]
        habits_ref = db.collection('users').document(user_id).collection('habits')
        docs = habits_ref.stream()
        
        # Get last 30 days
        labels = []
        data = []
        
        for i in range(29, -1, -1):
            date = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
            labels.append(date)
            
            # Count check-ins for this date
            count = 0
            for doc in docs:
                habit_data = doc.to_dict()
                check_ins = habit_data.get('checkIns', {})
                if date in check_ins:
                    count += 1
        
        return {"labels": labels, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting monthly trend: {str(e)}")

@app.get("/api/trends/yearly", response_model=Dict[str, Any])
async def get_yearly_trend(current_user: dict = Depends(get_current_user)):
    """Get yearly trend data"""
    try:
        user_id = current_user["uid"]
        habits_ref = db.collection('users').document(user_id).collection('habits')
        docs = habits_ref.stream()
        
        # Get last 12 months
        labels = []
        data = []
        
        for i in range(11, -1, -1):
            date = datetime.utcnow() - timedelta(days=30*i)
            month_label = date.strftime("%b %y")
            labels.append(month_label)
            
            # Count check-ins for this month
            month_start = date.replace(day=1)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            count = 0
            for doc in docs:
                habit_data = doc.to_dict()
                check_ins = habit_data.get('checkIns', {})
                for check_in_date in check_ins.keys():
                    check_date = datetime.strptime(check_in_date, "%Y-%m-%d")
                    if month_start <= check_date <= month_end:
                        count += 1
        
        return {"labels": labels, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting yearly trend: {str(e)}")

# Vercel serverless function handler
def handler(request):
    """Vercel serverless function entry point using FastAPI"""
    from mangum import Mangum
    
    # Create Mangum adapter for FastAPI
    mangum_handler = Mangum(app)
    
    # Convert Vercel request format to ASGI format
    asgi_request = {
        "type": "http",
        "method": request.get("method", "GET"),
        "path": request.get("path", "/"),
        "headers": [(k.lower(), v) for k, v in request.get("headers", {}).items()],
        "body": request.get("body", "").encode() if request.get("body") else b"",
        "query_string": request.get("queryStringParameters", {}),
    }
    
    # Handle the request through FastAPI
    return mangum_handler(asgi_request)

# For local development
if __name__ == "__main__":
    print("Starting HabitBuddy API for Vercel deployment...")
    print("API will be available at: http://localhost:8000")
    print("API docs will be available at: http://localhost:8000/docs")
    print("Using Firebase Authentication")
    uvicorn.run(app, host="0.0.0.0", port=8000)