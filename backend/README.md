# HabitBuddy Backend API

Backend API for the HabitBuddy habit tracking application. Built with FastAPI, PostgreSQL/SQLite, and Firebase Authentication.

## Features

- 🔐 Firebase Authentication integration
- 💾 PostgreSQL/SQLite database support
- 🚀 FastAPI framework with automatic API documentation
- 🔄 RESTful API design
- 📊 Habit tracking, statistics, and reminders

## Quick Start

### Prerequisites

- Python 3.8+
- PostgreSQL (optional, SQLite works too)
- Firebase project (for production auth)

### Installation

1. **Set up Python environment:**
   ```bash
   # Windows
   setup_env.bat
   
   # Linux/Mac
   ./setup_env.sh
   ```

2. **Set up PostgreSQL (optional):**
   ```bash
   # Windows
   setup_postgres.bat
   
   # Or follow POSTGRES_SETUP.md for manual setup
   ```

3. **Configure environment:**
   ```bash
   # Copy example environment file
   copy env.example .env
   
   # Edit .env and configure:
   # - DATABASE_URL (PostgreSQL or SQLite)
   # - PROD_MODE (false for local development, true for production)
   ```

4. **Run the server:**
   ```bash
   # Windows
   # Make sure dependencies are installed (bcrypt, passlib, python-jose)
   pip install -r requirements.txt
   
   venv\Scripts\python.exe main.py
   ```

   Server will start at: http://localhost:8000 (Proxy configured on Frontend to forward /api)

## Configuration

### Environment Variables

Create a `.env` file based on `env.example`:

```env
# PostgreSQL (Required for Native Auth)
DATABASE_URL=postgresql://dev:dev123@localhost:5432/habitbuddy

# Mode Configuration
# PROD_MODE=false enables Native Auth (Email/Password) for local dev
PROD_MODE=false

# CORS Origins (Optional - defaults to * if not set)
# ALLOWED_ORIGINS=http://localhost:4200
```

### Authentication Modes

1. **Local Development (`PROD_MODE=false`)**
   - Uses **Native Authentication** (Email/Password) stored in your local PostgreSQL database.
   - Bypasses Firebase completely.
   - Endpoints: `/api/auth/signup`, `/api/auth/login`.

2. **Production (`PROD_MODE=true`)**
   - Uses **Firebase Authentication**.
   - Verifies valid Firebase ID tokens.

## Database Setup

### PostgreSQL (Required)

Native authentication requires the `hashed_password` column in the `users` table.

```bash
# 1. Create Database & User
psql -U postgres
CREATE DATABASE habitbuddy;
CREATE USER dev WITH PASSWORD 'dev123';
GRANT ALL PRIVILEGES ON DATABASE habitbuddy TO dev;
\q

# 2. Add Schema (if not auto-created)
# The app will create tables on startup.
# If upgrading, ensure the password column exists:
psql -U dev -d habitbuddy -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password VARCHAR;"
```

## API Documentation

Once the server is running, visit:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user (Native Auth)
- `POST /api/auth/login` - Login user (Native Auth)
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/verify` - Verify authentication token

### Habits
- `GET /api/habits` - List all habits
- `POST /api/habits` - Create new habit
- `GET /api/habits/{id}` - Get habit details
- `PUT /api/habits/{id}` - Update habit
- `DELETE /api/habits/{id}` - Delete habit
- `POST /api/habits/{id}/check-in` - Check in for a habit

### Statistics
- `GET /api/stats/overview` - Get overview statistics
- `GET /api/stats/streaks` - Get streak information
- `GET /api/stats/completion-rate` - Get completion rates

### Reminders
- `GET /api/reminders` - List all reminders
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/{id}` - Update reminder
- `DELETE /api/reminders/{id}` - Delete reminder

## Development

### Project Structure

```
backend/
├── app/
│   ├── database.py          # Database models & connection
│   └── routers/
│       ├── auth.py          # Authentication endpoints
│       ├── habits.py        # Habit management
│       ├── stats.py         # Statistics
│       └── reminders.py     # Reminders
├── main.py                  # FastAPI application entry
├── requirements.txt         # Python dependencies
├── .env                     # Environment configuration (gitignored)
├── env.example              # Environment template
└── README.md               # This file
```

### Running Tests

```bash
pytest
```

## Deployment

### Firebase Functions

Deploy to Firebase Functions for serverless hosting:

```bash
firebase deploy --only functions
```

### Docker (Coming Soon)

Docker support will be added in future updates.

## Troubleshooting

### Firebase Authentication Errors

**Error:** "Default credentials were not found"
- **Solution:** Set `PROD_MODE=false` in `.env` for local development (allows graceful Firebase failures), or set up Firebase credentials

**Error:** "Project ID is required"
- **Solution:** The project ID is now hardcoded to 'abhyatus'. Ensure Firebase is properly initialized.

### Database Connection Issues

**PostgreSQL connection failed:**
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Ensure database exists: `psql -U postgres -l`

**SQLite file locked:**
- Close any other processes using the database
- Delete `habitbuddy.db` and restart the server

## Tech Stack

- **Framework:** FastAPI
- **Database:** PostgreSQL / SQLite (SQLAlchemy)
- **Authentication:** Firebase Admin SDK
- **Server:** Uvicorn
- **Python:** 3.8+

## License

See main project LICENSE file.

## Support

For issues and questions, please open an issue on GitHub.