import functions_framework
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration - PROD_MODE=false means dev mode (like Angular's production: false)
# PROD_MODE=true means production mode
PROD_MODE = os.getenv("PROD_MODE", "false").lower() == "true"
DEV_MODE = not PROD_MODE

# Initialize FastAPI app
app = FastAPI(
    title="HabitBuddy API",
    description="Backend API for HabitBuddy",
    version="1.0.0"
)

# Configure CORS
# Get allowed origins from env, default to ["*"] for easier local dev if not set
pass
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    allowed_origins = allowed_origins_env.split(",")
else:
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    try:
        firebase_admin.initialize_app()
        if DEV_MODE:
            print(" Running in DEV MODE - PostgreSQL database, auth tokens required")
        else:
            print(" Running in PRODUCTION MODE - PostgreSQL database, auth tokens required")
    except Exception as e:
        if DEV_MODE:
            print(f" Firebase initialization failed in dev mode: {e}")
            print("   Continuing - auth tokens will still be required")
        else:
            raise

# Import database and create tables
from app.database import engine, Base
Base.metadata.create_all(bind=engine)

# Import auth dependency
from app.routers.auth import get_current_user

# --- ROUTERS ---

from app.routers import habits, auth as auth_router, stats, reminders, categories

app.include_router(auth_router.router, prefix="/api/auth", tags=["authentication"])
app.include_router(habits.router, prefix="/api/habits", tags=["habits"], dependencies=[Depends(get_current_user)])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"], dependencies=[Depends(get_current_user)])
app.include_router(stats.router, prefix="/api/stats", tags=["statistics"], dependencies=[Depends(get_current_user)])
app.include_router(reminders.router, prefix="/api/reminders", tags=["reminders"], dependencies=[Depends(get_current_user)])

# --- COMMON ENDPOINTS ---

@app.get("/")
async def root():
    return {"message": "HabitBuddy API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "habitbuddy-api"}

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
    print("Starting HabitBuddy API...")
    uvicorn.run(app, host="0.0.0.0", port=8000)