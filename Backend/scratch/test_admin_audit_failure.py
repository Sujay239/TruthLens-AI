import requests
import json

BASE_URL = "http://localhost:8000"

def test_failed_admin_login():
    print("Attempting failed admin login...")
    payload = {
        "identifier": "admin_xyz",
        "password": "wrongpassword"
    }
    response = requests.post(f"{BASE_URL}/auth/admin/login", json=payload)
    print(f"Admin Login Response Status: {response.status_code}")

def check_audit_logs():
    from app.database import SessionLocal
    from app import models
    
    db = SessionLocal()
    try:
        print("\nChecking latest audit logs in database...")
        logs = db.query(models.AuditLog).order_by(models.AuditLog.id.desc()).limit(3).all()
        for log in logs:
            print(f"ID: {log.id} | Action: {log.action} | Status: {log.status} | User: {log.actor_username}")
    finally:
        db.close()

if __name__ == "__main__":
    test_failed_admin_login()
    check_audit_logs()
