# 🚀 HabitBuddy Backend

This directory contains the Python/FastAPI backend for HabitBuddy.

## 🛠️ Setup & Installation

We use a standard virtual environment for dependency management.

### Windows
Double-click `setup_env.bat` or run:
```powershell
.\setup_env.bat
```

### Mac/Linux
Run the setup script:
```bash
chmod +x setup_env.sh
./setup_env.sh
```

## 🌍 Environments & Configuration

The backend supports 3 modes, controlled by the `.env` file:

| Mode | Trigger | Database | Auth | Use Case |
|------|---------|----------|------|----------|
| **Mock** | `APP_MODE=mock` | In-Memory | Mock User | Frontend Dev (No backend deps) |
| **Local** | `APP_MODE=production` | SQLite | Firebase | Backend Dev (Persistent data) |
| **Prod** | `APP_MODE=production` + `DATABASE_URL` | PostgreSQL | Firebase | Live Deployment |

### Configuration (.env)
Copy `env.example` to `.env` and configure:

```ini
# 1. Mock Mode
APP_MODE=mock

# 2. Local Development (Default)
APP_MODE=production
DATABASE_URL=sqlite:///./habitbuddy.db
# Requires FIREBASE_SERVICE_ACCOUNT_KEY for admin tasks

# 3. Production
APP_MODE=production
DATABASE_URL=postgresql://user:pass@host/db
```

## 🏃‍♂️ Running the Server

After setup, the server will start automatically. To run it manually:

### Windows
```powershell
venv\Scripts\python.exe main.py
```

### Mac/Linux
```bash
venv/bin/python3 main.py
```

## 🌐 API Endpoints

- **Base URL**: `http://localhost:8000`
- **Docs**: `http://localhost:8000/docs`
- **Health**: `http://localhost:8000/health`

## 🔧 Troubleshooting

### "Port already in use"
Kill the process on port 8000:
- **Windows**: `netstat -ano | findstr :8000` then `taskkill /PID <PID> /F`
- **Mac/Linux**: `lsof -i :8000` then `kill -9 <PID>`

## 🧪 Testing

To run tests:
```bash
# Activate venv first!
pytest
```