# 🚀 How to Run HabitBuddy Backend Locally

## ✅ Quick Start (Windows)

### Step 1: Install Dependencies
```powershell
# Install required packages
py -m pip install fastapi uvicorn python-dotenv requests
```

### Step 2: Start the Backend
```powershell
# Navigate to backend directory
cd backend

# Run the API server
py main-simple.py
```

### Step 3: Test the API
```powershell
# In a new terminal, run the test script
cd backend
py test-local-api.py
```

## ✅ Quick Start (Mac/Linux)

### Step 1: Install Dependencies
```bash
# Install required packages
python3 -m pip install fastapi uvicorn python-dotenv requests
```

### Step 2: Start the Backend
```bash
# Navigate to backend directory
cd backend

# Run the API server
python3 main-simple.py
```

### Step 3: Test the API
```bash
# In a new terminal, run the test script
cd backend
python3 test-local-api.py
```

## 🌐 Access Points

Once the server is running, you can access:

- **API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📋 What You'll See

When you start the server, you should see:
```
Starting HabitBuddy API in development mode...
API will be available at: http://localhost:8000
API docs will be available at: http://localhost:8000/docs
Using mock data for local development
No authentication required for local development
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

## 🧪 Testing the API

### Option 1: Use the Test Script
```powershell
# Windows
cd backend
py test-local-api.py

# Mac/Linux
cd backend
python3 test-local-api.py
```

### Option 2: Test with PowerShell (Windows)
```powershell
# Test health endpoint
Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get

# Test habits endpoint
Invoke-RestMethod -Uri "http://localhost:8000/api/habits" -Method Get
```

### Option 3: Test with curl (Mac/Linux)
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test habits endpoint
curl http://localhost:8000/api/habits
```

### Option 4: Use Browser
- Visit http://localhost:8000/docs for interactive API documentation
- Visit http://localhost:8000/health to see the health check

## 🔧 Troubleshooting

### Issue: "Python was not found"
**Solution**: Use `py` instead of `python` on Windows
```powershell
# Wrong
python main-simple.py

# Correct
py main-simple.py
```

### Issue: "Module not found"
**Solution**: Install the required packages
```powershell
# Windows
py -m pip install fastapi uvicorn python-dotenv requests

# Mac/Linux
python3 -m pip install fastapi uvicorn python-dotenv requests
```

### Issue: "Port already in use"
**Solution**: Kill the process using port 8000
```powershell
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -i :8000
kill -9 <PID_NUMBER>
```

### Issue: PowerShell syntax errors
**Solution**: Use separate commands instead of `&&`
```powershell
# Wrong
cd backend && py main-simple.py

# Correct
cd backend
py main-simple.py
```

## 📊 API Endpoints

The simple API includes these endpoints:

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/habits` - Get all habits (mock data)
- `POST /api/habits` - Create new habit
- `POST /api/habits/{id}/check-in` - Add check-in
- `GET /api/stats/overview` - Get overview statistics

## 🎯 Next Steps

1. **Start the backend**: `cd backend && py main-simple.py`
2. **Start the Angular frontend**: `npm start` (in another terminal)
3. **Test integration**: Visit http://localhost:4200
4. **View API docs**: Visit http://localhost:8000/docs

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Uvicorn Documentation](https://www.uvicorn.org/)
- [Angular Documentation](https://angular.io/docs)

---

**🎉 That's it!** Your HabitBuddy backend is now running locally and ready for development!
