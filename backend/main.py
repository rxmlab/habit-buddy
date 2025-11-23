import functions_framework
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, auth
import os
from dotenv import load_dotenv
from typing import List, Optional
import datetime

# Load environment variables
load_dotenv()

# Configuration
APP_MODE = os.getenv("APP_MODE", "production")  # 'production' or 'mock'

# Initialize FastAPI app
app = FastAPI(
    title="HabitBuddy API",
    description=f"Backend API for HabitBuddy ({APP_MODE} mode)",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "https://habit-buddy.web.app",
        "https://habit-buddy.firebaseapp.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MOCK DATA STORE ---
MOCK_HABITS = [
    {
        "id": "1",
        "title": "Morning Exercise",
        "days_target": 30,
        "color": "#3b82f6",
        "created_at": "2024-01-01T00:00:00Z",
        "check_ins": {
            "2024-01-01": "hash1",
            "2024-01-02": "hash2"
        },
        "reminder": {
            "time": "07:00",
            "days": [1, 2, 3, 4, 5],
            "window": 30
        },
        "badge": {
            "level": "beginner",
            "name": "Beginner",
            "description": "Completed 21+ days",
            "icon": "🌿",
            "days_required": 21
        }
    },
    {
        "id": "2",
        "title": "Read 30 Minutes",
        "days_target": 50,
        "color": "#10b981",
        "created_at": "2024-01-01T00:00:00Z",
        "check_ins": {
            "2024-01-01": "hash3"
        },
        "reminder": None,
        "badge": None
    }
]

# --- DEPENDENCIES ---

async def get_current_user_mock(request: Request):
    """Mock user for development"""
    return {
        "uid": "mock-user-id",
        "email": "mock@example.com",
        "name": "Mock User"
    }

if APP_MODE == "mock":
    print("⚠️ RUNNING IN MOCK MODE")
    get_current_user = get_current_user_mock
else:
    # Initialize Firebase Admin SDK
    if not firebase_admin._apps:
        firebase_admin.initialize_app()
    
    # Import database and create tables
    from app.database import engine, Base
    Base.metadata.create_all(bind=engine)
    
    # Import real auth dependency
    from app.routers.auth import get_current_user

# --- ROUTERS ---

if APP_MODE == "mock":
    # Mock Endpoints
    @app.get("/api/habits")
    async def get_habits_mock():
        return MOCK_HABITS

    @app.post("/api/habits")
    async def create_habit_mock(habit_data: dict):
        new_habit = {
            "id": str(len(MOCK_HABITS) + 1),
            "title": habit_data.get("title", "New Habit"),
            "days_target": habit_data.get("days_target", 30),
            "color": habit_data.get("color", "#3b82f6"),
            "created_at": datetime.datetime.utcnow().isoformat(),
            "check_ins": {},
            "reminder": habit_data.get("reminder"),
            "badge": None
        }
        MOCK_HABITS.append(new_habit)
        return new_habit

    @app.post("/api/habits/{habit_id}/check-in")
    async def check_in_habit_mock(habit_id: str):
        for habit in MOCK_HABITS:
            if habit["id"] == habit_id:
                today = datetime.datetime.now().strftime("%Y-%m-%d")
                habit["check_ins"][today] = f"hash_{today}"
                return {"message": "Check-in added successfully", "date": today}
        return {"error": "Habit not found"}, 404
        
    @app.get("/api/stats/overview")
    async def get_overview_stats_mock():
        return {
            "total_completed": 3,
            "average_completion": 75.5,
            "best_current_streak": 5,
            "best_longest_streak": 10,
            "habits_count": len(MOCK_HABITS)
        }
        
    @app.get("/api/auth/me")
    async def get_me_mock():
        return {
            "id": "mock-user-id",
            "email": "mock@example.com",
            "display_name": "Mock User",
            "created_at": "2024-01-01T00:00:00Z"
        }

else:
    # Production Routers
    from app.routers import habits, auth as auth_router, stats, reminders
    
    app.include_router(auth_router.router, prefix="/api/auth", tags=["authentication"])
    app.include_router(habits.router, prefix="/api/habits", tags=["habits"], dependencies=[Depends(get_current_user)])
    app.include_router(stats.router, prefix="/api/stats", tags=["statistics"], dependencies=[Depends(get_current_user)])
    app.include_router(reminders.router, prefix="/api/reminders", tags=["reminders"], dependencies=[Depends(get_current_user)])

# --- COMMON ENDPOINTS ---

@app.get("/")
async def root():
    return {"message": "HabitBuddy API is running", "version": "1.0.0", "mode": APP_MODE}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "habitbuddy-api", "mode": APP_MODE}

# --- FIREBASE FUNCTIONS ---

@functions_framework.http
def api(request):
    """Firebase Functions HTTP entry point"""
    import asyncio
    
    async def call_app():
        scope = {
            "type": "http",
            "method": request.method,
            "path": request.path,
            "query_string": request.query_string.encode(),
            "headers": [(k.lower(), v.encode()) for k, v in request.headers.items()],
        }
        
        class MockRequest:
            def __init__(self, scope, body):
                self.scope = scope
                self.body = body
                self.method = scope["method"]
                self.url = f"http://localhost{scope['path']}"
                self.headers = dict(scope["headers"])
        
        mock_request = MockRequest(scope, request.get_data())
        response = await app(mock_request.scope, mock_request.body)
        return response
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        response = loop.run_until_complete(call_app())
        return response
    finally:
        loop.close()

if __name__ == "__main__":
    import uvicorn
    print(f"Starting HabitBuddy API in {APP_MODE} mode...")
    uvicorn.run(app, host="0.0.0.0", port=8000)