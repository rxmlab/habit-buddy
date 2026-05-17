import os
from dotenv import load_dotenv
from sqlalchemy import text
from app.database import engine

load_dotenv()

def upgrade_db():
    print("Upgrading database schema...")
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user' NOT NULL;"))
            print("Successfully added 'role' column to 'users' table.")
        except Exception as e:
            print(f"Error adding column (it might already exist): {e}")

if __name__ == "__main__":
    upgrade_db()
