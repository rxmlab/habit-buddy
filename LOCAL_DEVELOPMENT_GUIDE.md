# 🚀 HabitBuddy Local Development Guide

## ✅ What You Need

### Required Software
- **Python 3.8+** - [Download from python.org](https://python.org)
- **Node.js 16+** - [Download from nodejs.org](https://nodejs.org) (for Angular frontend)
- **Git** - [Download from git-scm.com](https://git-scm.com)

### Optional Software
- **VS Code** - Recommended IDE
- **Postman** - For API testing
- **Firebase CLI** - For deployment (optional for local dev)

## 🔧 Quick Start (Windows)

### 1. Start the Backend
**Option A: Using Python directly**
```powershell
# Navigate to backend directory
cd backend

# Run the simple API server
py main-simple.py
```

**Option B: Using the startup script**
```powershell
# Navigate to backend directory
cd backend

# Run the startup script
start-backend-local.bat
```

### 2. Start the Frontend (in a new terminal)
```powershell
# Install dependencies (first time only)
npm install

# Start Angular development server
npm start
# or
ng serve
```

### 3. Test the API
```powershell
# Navigate to backend directory
cd backend

# Run the test script
py test-local-api.py
```

## 🔧 Quick Start (Mac/Linux)

### 1. Start the Backend
```bash
# Navigate to backend directory
cd backend

# Run the simple API server
python3 main-simple.py

# Or use the startup script
./start-backend-local.sh
```

### 2. Start the Frontend (in a new terminal)
```bash
# Install dependencies (first time only)
npm install

# Start Angular development server
npm start
# or
ng serve
```

### 3. Test the API
```bash
# Navigate to backend directory
cd backend

# Run the test script
python3 test-local-api.py
```

## 🌐 Access Points

Once running, you can access:

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000/health

## 🗄️ Database

### Local Development
- **SQLite** database is used automatically
- Database file: `backend/habitbuddy.db`
- No additional setup required

### Production
- **PostgreSQL** (when deployed to Firebase)
- Configure `DATABASE_URL` environment variable

## 🔐 Authentication

### Local Development
- **Mock authentication** is used
- Any token is accepted for testing
- User ID: `local-user-123`

### Production
- **Firebase Authentication** is used
- Real token verification
- User management through Firebase

## 📁 Project Structure

```
habit-buddy/
├── backend/                 # FastAPI backend
│   ├── main-simple.py       # Simple local development server
│   ├── main-local.py        # Full local development server
│   ├── main.py             # Production server
│   ├── requirements.txt    # Full dependencies
│   ├── requirements-minimal.txt  # Minimal dependencies
│   ├── env.example         # Environment template
│   ├── start-backend-local.bat # Windows startup script
│   ├── start-backend-local.sh  # Mac/Linux startup script
│   ├── test-local-api.py   # API test script
│   ├── test-api.py         # Additional API test script
│   ├── HOW_TO_RUN_BACKEND.md # Backend documentation
│   └── app/                # Application code
│       ├── database.py     # Database models
│       ├── schemas.py      # Pydantic models
│       └── routers/        # API endpoints
├── functions/              # Firebase Functions
└── projects/habit-buddy/   # Angular frontend
```

## 🧪 Testing the API

### Manual Testing
1. **Health Check**: `GET http://localhost:8000/health`
2. **Create Habit**: `POST http://localhost:8000/api/habits`
3. **Get Habits**: `GET http://localhost:8000/api/habits`

### Using the Test Script
```bash
python test-api.py
```

### Using Postman
1. Import the API collection
2. Set base URL to `http://localhost:8000`
3. Add `Authorization: Bearer test-token` header

### Using curl
```bash
# Health check
curl http://localhost:8000/health

# Create habit
curl -X POST http://localhost:8000/api/habits \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Habit", "days_target": 30, "color": "#3b82f6"}'
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Python Not Found
**Windows:**
```powershell
# Check Python installation
py --version

# If not found, install Python from python.org
# Then use 'py' command instead of 'python'
```

**Mac/Linux:**
```bash
# Check Python installation
python3 --version

# If not found, install Python from python.org
```
**Solution**: Install Python from [python.org](https://python.org)

#### 2. Port Already in Use
**Windows:**
```powershell
# Check what's using port 8000
netstat -ano | findstr :8000

# Kill process by PID
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux:**
```bash
# Check what's using port 8000
lsof -i :8000

# Kill process
kill -9 <PID_NUMBER>
```
**Solution**: Kill the process or change port in `main-simple.py`

#### 3. Module Not Found
**Windows:**
```powershell
# Install dependencies directly
py -m pip install fastapi uvicorn python-dotenv requests

# Or install minimal requirements
py -m pip install -r backend/requirements-minimal.txt
```

**Mac/Linux:**
```bash
# Install dependencies directly
python3 -m pip install fastapi uvicorn python-dotenv requests

# Or install minimal requirements
python3 -m pip install -r backend/requirements-minimal.txt
```

#### 4. Database Errors
**Note**: The simple API (`main-simple.py`) uses mock data, so no database file is created.

**If using the full API (`main-local.py`):**
```powershell
# Windows
del backend\habitbuddy.db

# Mac/Linux
rm backend/habitbuddy.db
```

#### 5. CORS Errors
- Check that frontend is running on `http://localhost:4200`
- Verify CORS settings in `main-simple.py`

## 🚀 Development Workflow

### 1. Backend Development
**Windows:**
```powershell
# Start backend
cd backend
py main-simple.py

# Or use the startup script
start-backend-local.bat

# Test changes
py test-local-api.py
```

**Mac/Linux:**
```bash
# Start backend
cd backend
python3 main-simple.py

# Or use the startup script
./start-backend-local.sh

# Test changes
python3 test-local-api.py
```

### 2. Frontend Development
```bash
# Start frontend
npm start

# Make changes to Angular code
# Browser will auto-reload

# Test integration
# Visit http://localhost:4200
```

### 3. Full Stack Testing
1. Start both backend and frontend
2. Open http://localhost:4200
3. Test all features
4. Check browser console for errors
5. Check backend logs for errors

## 📊 API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify token
- `GET /api/auth/me` - Get user profile

### Habits
- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create habit
- `GET /api/habits/{id}` - Get specific habit
- `PUT /api/habits/{id}` - Update habit
- `DELETE /api/habits/{id}` - Delete habit

### Check-ins
- `POST /api/habits/{id}/check-in` - Add check-in
- `DELETE /api/habits/{id}/check-in/{date}` - Remove check-in

### Statistics
- `GET /api/stats/overview` - Get overview stats
- `GET /api/stats/habit/{id}` - Get habit stats
- `GET /api/stats/habits` - Get all habits stats

### Reminders
- `GET /api/reminders` - Get all reminders
- `GET /api/reminders/{id}` - Get habit reminder
- `PUT /api/reminders/{id}` - Update reminder
- `DELETE /api/reminders/{id}` - Delete reminder

## 🔄 Next Steps

### Local Development
1. **Test all endpoints** using the test script
2. **Integrate with Angular** frontend
3. **Add new features** and test locally
4. **Debug issues** using logs and browser dev tools

### Production Deployment
1. **Test with Firebase Authentication**
2. **Set up PostgreSQL database**
3. **Deploy to Firebase Functions**
4. **Configure environment variables**

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Angular Documentation](https://angular.io/docs)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Firebase Documentation](https://firebase.google.com/docs)

---

**🎉 Happy Coding!** Your HabitBuddy application is now running locally and ready for development!
