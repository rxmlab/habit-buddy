#!/bin/bash
echo "Setting up HabitBuddy Backend Environment..."

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "Python 3 not found! Please install Python."
    exit 1
fi

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Install dependencies using direct path (avoids activation issues)
echo "Installing dependencies..."
venv/bin/pip install -r requirements.txt

echo ""
echo "Setup complete!"
echo ""
echo "To start the server, run:"
echo "venv/bin/python3 main.py"
echo ""
