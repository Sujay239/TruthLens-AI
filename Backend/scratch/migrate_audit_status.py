from app.database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        try:
            print("Checking if 'status' column exists in 'audit_logs'...")
            result = conn.execute(text("SHOW COLUMNS FROM audit_logs LIKE 'status'"))
            column_exists = result.fetchone() is not None
            
            if not column_exists:
                print("Adding 'status' column to 'audit_logs' table...")
                conn.execute(text("ALTER TABLE audit_logs ADD COLUMN status VARCHAR(50) DEFAULT 'success' AFTER description"))
                conn.commit()
                print("Migration successful: Added 'status' column.")
            else:
                print("'status' column already exists.")
        except Exception as e:
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
