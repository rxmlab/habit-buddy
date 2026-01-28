# PostgreSQL Setup for HabitBuddy

## Step 1: Create Database and User

Run this script to set up your PostgreSQL database:

**Windows (PowerShell):**
```powershell
# Run psql as postgres user
psql -U postgres

# Then run these commands in psql:
CREATE DATABASE habitbuddy;
CREATE USER dev WITH PASSWORD 'dev123';
GRANT ALL PRIVILEGES ON DATABASE habitbuddy TO dev;
\c habitbuddy
GRANT ALL ON SCHEMA public TO dev;
\q
```

**Or use the batch file:**
```cmd
cd backend
# You'll be prompted for postgres password
psql -U postgres -c "CREATE DATABASE habitbuddy;"
psql -U postgres -c "CREATE USER dev WITH PASSWORD 'dev123';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE habitbuddy TO dev;"
psql -U postgres -d habitbuddy -c "GRANT ALL ON SCHEMA public TO dev;"
# Add support for Native Auth (hashed passwords)
psql -U postgres -d habitbuddy -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password VARCHAR;"
```

## Step 2: Create `.env` File

Create `backend/.env` with this content:

```env
# Database - PostgreSQL
DATABASE_URL=postgresql://dev:dev123@localhost:5432/habitbuddy

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# CORS
ALLOWED_ORIGINS=http://localhost:4200,https://abhyatus.web.app,https://abhyatus.firebaseapp.com
```

## Step 3: Run the Backend

```cmd
cd backend
venv\Scripts\python.exe main.py
```

The tables will be created automatically on first run.

## Verify Setup

1. Check that the backend starts without errors
2. Look for: `✓ Database tables created/verified`
3. Check that Firebase Admin SDK initializes
4. Test the health endpoint: http://localhost:8000/health

## Troubleshooting

### psql Command Not Found (Windows)

If you get an error like `'psql' is not recognized`, PostgreSQL is installed but not in your PATH.

**Solution 1: Use the batch file (recommended)**
The `setup_postgres.bat` script will automatically find PostgreSQL in common installation locations.

**Solution 2: Add PostgreSQL to PATH**
1. Find your PostgreSQL installation (usually `C:\Program Files\PostgreSQL\<version>\bin`)
2. Add it to your system PATH:
   - Open System Properties → Environment Variables
   - Edit the `Path` variable
   - Add: `C:\Program Files\PostgreSQL\<version>\bin`
   - Restart your terminal

**Solution 3: Use full path**
```powershell
# Replace <version> with your PostgreSQL version (e.g., 16, 15, 14)
& "C:\Program Files\PostgreSQL\<version>\bin\psql.exe" -U postgres
```

**Solution 4: Install PostgreSQL**
If PostgreSQL is not installed, download it from: https://www.postgresql.org/download/windows/
