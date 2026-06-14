import requests
import json

BASE_URL = "http://localhost:8000"

def check_admin_mgmt():
    # We need a token. Let's try to login as the default admin.
    # From update_db_admins_schema.py: Sujay2008 / 760212 (PIN)
    # Password was $2a$12$... which is bcrypt.
    # I'll just use the verification script approach to get a token if I can.
    
    # Actually, I'll just try to hit the endpoint without a token first to see if I get 401 (CORS should still work).
    try:
        print("Checking GET /admin/manage/ without token...")
        response = requests.get(f"{BASE_URL}/admin/manage/")
        print(f"Status: {response.status_code}")
        print(f"Headers: {response.headers}")
        print(f"Body: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_admin_mgmt()
