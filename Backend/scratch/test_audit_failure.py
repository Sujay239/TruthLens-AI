import requests
import json

BASE_URL = "http://localhost:8000"

def test_failed_login():
    print("Attempting failed login...")
    payload = {
        "username": "nonexistent_user_xyz",
        "password": "wrongpassword"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=payload)
    print(f"Login Response Status: {response.status_code}")
    print(f"Login Response Body: {response.text}")

def check_audit_logs():
    # We need an admin token to check audit logs via API
    # But we can also check the DB directly
    from app.database import SessionLocal
    from app import models
    
    db = SessionLocal()
    try:
        print("\nChecking latest audit logs in database...")
        logs = db.query(models.AuditLog).order_by(models.AuditLog.id.desc()).limit(5).all()
        for log in logs:
            print(f"ID: {log.id} | Action: {log.action} | Status: {log.status} | User: {log.actor_username} | Desc: {log.description}")
    finally:
        db.close()

if __name__ == "__main__":
    test_failed_login()
    check_audit_logs()
