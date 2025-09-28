import functions_framework
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    firebase_admin.initialize_app()

# Import database and create tables
from app.database import engine, Base
Base.metadata.create_all(bind=engine)

# Create FastAPI app
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

# Import routers
from app.routers import habits, auth as auth_router, stats, reminders
from app.routers.auth import get_current_user

# Include routers
app.include_router(
    auth_router.router,
    prefix="/api/auth",
    tags=["authentication"]
)

app.include_router(
    habits.router,
    prefix="/api/habits",
    tags=["habits"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    stats.router,
    prefix="/api/stats",
    tags=["statistics"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    reminders.router,
    prefix="/api/reminders",
    tags=["reminders"],
    dependencies=[Depends(get_current_user)]
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "HabitBuddy API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "habitbuddy-api"}

# Firebase Functions entry point
@functions_framework.http
def api(request):
    """Firebase Functions HTTP entry point"""
    import asyncio
    from fastapi import Request
    from fastapi.responses import Response
    
    # Convert Firebase request to FastAPI request
    async def call_app():
        scope = {
            "type": "http",
            "method": request.method,
            "path": request.path,
            "query_string": request.query_string.encode(),
            "headers": [(k.lower(), v.encode()) for k, v in request.headers.items()],
        }
        
        # Create a mock ASGI request
        class MockRequest:
            def __init__(self, scope, body):
                self.scope = scope
                self.body = body
                self.method = scope["method"]
                self.url = f"http://localhost{scope['path']}"
                self.headers = dict(scope["headers"])
        
        mock_request = MockRequest(scope, request.get_data())
        
        # Call FastAPI app
        response = await app(mock_request.scope, mock_request.body)
        
        return response
    
    # Run the async function
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        response = loop.run_until_complete(call_app())
        return response
    finally:
        loop.close()