# 🚀 HabitBuddy Backend

This directory contains all backend-related files for the HabitBuddy application.

## 📁 Contents

- **`main-simple.py`** - Simple API server with mock data (recommended for local development)
- **`main-local.py`** - Full API server with database (requires more setup)
- **`main.py`** - Production server for deployment
- **`requirements.txt`** - Full Python dependencies
- **`requirements-minimal.txt`** - Minimal dependencies for simple API
- **`env.example`** - Environment configuration template
- **`start-backend-local.bat`** - Windows startup script
- **`start-backend-local.sh`** - Mac/Linux startup script
- **`test-local-api.py`** - Automated API testing script
- **`test-api.py`** - Additional API testing script
- **`HOW_TO_RUN_BACKEND.md`** - Detailed backend documentation
- **`app/`** - Application code (database models, schemas, routers)

## 🚀 Quick Start

### Windows
```powershell
# Install dependencies
py -m pip install fastapi uvicorn python-dotenv requests

# Start the server
py main-simple.py

# Test the API (in new terminal)
py test-local-api.py
```

### Mac/Linux
```bash
# Install dependencies
python3 -m pip install fastapi uvicorn python-dotenv requests

# Start the server
python3 main-simple.py

# Test the API (in new terminal)
python3 test-local-api.py
```

## 🌐 Access Points

- **API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📚 Documentation

- **`HOW_TO_RUN_BACKEND.md`** - Complete backend setup guide
- **`../LOCAL_DEVELOPMENT_GUIDE.md`** - Full development guide
- **`../INTEGRATION_GUIDE.md`** - Frontend integration guide

## 🧪 Testing

Run the automated test script to verify everything works:
```bash
py test-local-api.py  # Windows
python3 test-local-api.py  # Mac/Linux
```

Expected output:
```
SUCCESS: Health check passed!
SUCCESS: Habits endpoint passed! (Found 2 habits)
SUCCESS: Create habit passed! (Created habit: Test Habit)
```

## 🔧 Troubleshooting

### Common Issues
1. **"Python was not found"** - Use `py` instead of `python` on Windows
2. **"Module not found"** - Install dependencies: `py -m pip install fastapi uvicorn python-dotenv requests`
3. **"Port already in use"** - Kill process using port 8000 or change port in `main-simple.py`

### Getting Help
- Check `HOW_TO_RUN_BACKEND.md` for detailed troubleshooting
- View API documentation at http://localhost:8000/docs
- Check the main project documentation in the parent directory

---

**🎉 Ready to go!** Your HabitBuddy backend is organized and ready for development!