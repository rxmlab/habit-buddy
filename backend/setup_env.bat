@echo off
echo Setting up HabitBuddy Backend Environment...

REM Check for Python
py --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python not found! Please install Python.
    exit /b 1
)

REM Create venv if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    py -m venv venv
)

REM Install dependencies using direct path (avoids activation issues)
echo Installing dependencies...
venv\Scripts\python.exe -m pip install -r requirements.txt

echo.
echo Setup complete!
echo.
echo To start the server, run:
echo venv\Scripts\python.exe main.py
echo.
pause
