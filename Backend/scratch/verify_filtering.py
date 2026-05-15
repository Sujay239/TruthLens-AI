
import requests
import json

BASE_URL = "http://localhost:8000"
# Note: I need an admin token. I'll assume for testing purposes I can mock it or check if the code works by inspecting logic.
# But I can't easily get a token without credentials.
# Instead, I'll run a local test by importing the router and mocking dependencies if possible, 
# or just assume the logic is correct since it's straightforward SQLALchemy.

# Let's try to run a script that imports the logic and tests it against the DB directly.

from app.database import SessionLocal
from app import models
from app.routers.admin_history import get_all_history

db = SessionLocal()

# Mock current_admin
class MockAdmin:
    id = 1
    username = "admin"

admin = MockAdmin()

print("Testing News filter...")
news_result = get_all_history(scan_type="News", db=db, current_admin=admin)
print(f"Count for News: {len(news_result)}")
for item in news_result:
    print(f" - {item['filename']} (ID: {item['id']}, ScanID: {item['scan_id']})")

print("\nTesting All filter...")
all_result = get_all_history(scan_type="All", db=db, current_admin=admin)
print(f"Count for All: {len(all_result)}")

print("\nTesting Image filter...")
image_result = get_all_history(scan_type="Image", db=db, current_admin=admin)
print(f"Count for Image: {len(image_result)}")

db.close()
