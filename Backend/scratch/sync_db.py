import sys
import os

# Add the parent directory to sys.path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import init_db

try:
    print("Initializing database with new models...")
    init_db()
    print("Database sync completed.")
except Exception as e:
    print(f"Error syncing database: {e}")
