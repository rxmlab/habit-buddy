from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="HabitBuddy API",
    description="Backend API for HabitBuddy habit tracking application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",  # Angular dev server
        "https://habit-buddy.web.app",  # Firebase hosting
        "https://habit-buddy.firebaseapp.com",  # Firebase hosting alt
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data for testing
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

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "HabitBuddy API is running locally", "version": "1.0.0", "mode": "development"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "habitbuddy-api", "mode": "development"}

@app.get("/api/habits")
async def get_habits():
    """Get all habits (mock data)"""
    return MOCK_HABITS

@app.post("/api/habits")
async def create_habit(habit_data: dict):
    """Create a new habit (mock)"""
    new_habit = {
        "id": str(len(MOCK_HABITS) + 1),
        "title": habit_data.get("title", "New Habit"),
        "days_target": habit_data.get("days_target", 30),
        "color": habit_data.get("color", "#3b82f6"),
        "created_at": "2024-01-01T00:00:00Z",
        "check_ins": {},
        "reminder": habit_data.get("reminder"),
        "badge": None
    }
    MOCK_HABITS.append(new_habit)
    return new_habit

@app.get("/api/stats/overview")
async def get_overview_stats():
    """Get overview statistics (mock data)"""
    return {
        "total_completed": 3,
        "average_completion": 75.5,
        "best_current_streak": 5,
        "best_longest_streak": 10,
        "habits_count": len(MOCK_HABITS)
    }

@app.post("/api/habits/{habit_id}/check-in")
async def check_in_habit(habit_id: str):
    """Add a check-in (mock)"""
    # Find habit and add check-in
    for habit in MOCK_HABITS:
        if habit["id"] == habit_id:
            import datetime
            today = datetime.datetime.now().strftime("%Y-%m-%d")
            habit["check_ins"][today] = f"hash_{today}"
            return {"message": "Check-in added successfully", "date": today}
    
    return {"error": "Habit not found"}, 404

if __name__ == "__main__":
    import uvicorn
    print("Starting HabitBuddy API in development mode...")
    print("API will be available at: http://localhost:8000")
    print("API docs will be available at: http://localhost:8000/docs")
    print("Using mock data for local development")
    print("No authentication required for local development")
    uvicorn.run(app, host="0.0.0.0", port=8000)
