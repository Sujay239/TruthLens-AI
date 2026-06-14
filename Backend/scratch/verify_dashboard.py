
from app.database import SessionLocal
from app import models
from app.routers.dashboard import get_admin_dashboard_overview

db = SessionLocal()

# Mock current_admin
class MockAdmin:
    id = 1
    username = "admin"

admin = MockAdmin()

print("Testing Admin Dashboard Overview aggregation...")
overview = get_admin_dashboard_overview(db=db, current_admin=admin)

print(f"Total Scans: {overview.total_scans}")
print(f"Total Real: {overview.total_real_detected}")
print(f"Total Fake: {overview.total_fake_detected}")

print("\nBreakdown:")
for item in overview.scan_type_breakdown:
    print(f" - {item.name}: {item.scans}")

# Verify sums
calculated_total = sum(item.scans for item in overview.scan_type_breakdown)
print(f"\nCalculated Sum of Breakdown: {calculated_total}")

if calculated_total == overview.total_scans:
    print("\nSUCCESS: Dashboard totals match breakdown counts from specific tables.")
else:
    print(f"\nFAILURE: Dashboard totals ({overview.total_scans}) do not match breakdown sum ({calculated_total}).")

db.close()
