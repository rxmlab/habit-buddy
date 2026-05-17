import functions_framework
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

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



# Import database and create tables
from app.database import engine, Base
Base.metadata.create_all(bind=engine)

# Import auth dependency
from app.routers.auth import get_current_user

# --- ROUTERS ---

from app.routers import habits, auth as auth_router, stats, reminders, categories, badges, admin

app.include_router(auth_router.router, prefix="/api/auth", tags=["authentication"])
app.include_router(habits.router, prefix="/api/habits", tags=["habits"], dependencies=[Depends(get_current_user)])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"], dependencies=[Depends(get_current_user)])
app.include_router(stats.router, prefix="/api/stats", tags=["statistics"], dependencies=[Depends(get_current_user)])
app.include_router(reminders.router, prefix="/api/reminders", tags=["reminders"], dependencies=[Depends(get_current_user)])
app.include_router(badges.router, prefix="/api/badges", tags=["badges"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

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

# --- FRONTEND SERVING (FOR RENDER DEPLOYMENT) ---

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Mount the Angular frontend if the dist directory exists
# This assumes you run `npm run build` before starting the server
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "..", "dist", "abhyatus", "browser")
frontend_dist = os.path.abspath(frontend_dist)

if os.path.isdir(frontend_dist):
    print(f"Serving frontend from {frontend_dist}")
    
    # Custom 404 handler for Angular routing (SPA)
    @app.exception_handler(404)
    async def custom_404_handler(request, exc):
        # If the request is for the API, return a JSON 404
        if request.url.path.startswith("/api/"):
            return {"detail": "Not Found"}
        # Otherwise, return the Angular index.html to handle client-side routing
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"detail": "Frontend index.html not found"}

    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
else:
    print(f"Frontend dist not found at {frontend_dist}. Running in API-only mode.")

if __name__ == "__main__":
    import uvicorn
    print("Starting HabitBuddy API...")
    uvicorn.run(app, host="0.0.0.0", port=8000)