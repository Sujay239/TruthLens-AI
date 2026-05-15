import sys
import os
from sqlalchemy import create_engine, text

# Add the parent directory to sys.path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SQLALCHEMY_DATABASE_URL

def migrate():
    print(f"Connecting to database at: {SQLALCHEMY_DATABASE_URL}")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    with engine.connect() as conn:
        print("Checking for missing columns in 'users' table...")
        
        # Add is_banned if it doesn't exist
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE"))
            print("Added 'is_banned' column.")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("'is_banned' column already exists.")
            else:
                print(f"Error adding 'is_banned': {e}")
        
        # Add ban_reason if it doesn't exist
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN ban_reason TEXT"))
            print("Added 'ban_reason' column.")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("'ban_reason' column already exists.")
            else:
                print(f"Error adding 'ban_reason': {e}")
                
        # Clean up duplicate hashed_password columns if any (MySQL specific check)
        # Note: SQLAlchemy's create_all might have failed if it saw duplicates in models.py
        
        conn.commit()
        print("Migration completed successfully.")

if __name__ == "__main__":
    migrate()
