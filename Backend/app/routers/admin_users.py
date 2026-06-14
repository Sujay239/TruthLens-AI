from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas, dependencies, utils
from app.utils.audit_utils import record_audit_log

router = APIRouter(
    prefix="/admin/users",
    tags=["Admin User Management"]
)

@router.get("/", response_model=List[schemas.AdminUserFullResponse])
def get_all_users(
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin),
):
    users = db.query(models.User).all()
    return users

@router.post("/{user_id}/toggle-status")
def toggle_user_status(
    user_id: int,
    req: Request,
    payload: schemas.AdminStatusChangeRequest,
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin),
):
    # Verify Admin Password
    if not utils.verify_password(payload.admin_password, current_admin.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid admin password. Action unauthorized.")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # We toggle is_banned instead of is_active if that's what the user prefers
    # but the UI uses is_active for "Active/Disabled".
    # User asked for "is_banned" in DB.
    
    old_status = "Banned" if user.is_banned else "Active"
    user.is_banned = not user.is_banned
    # Keep is_active in sync or use it as a logical flag
    user.is_active = not user.is_banned
    
    if user.is_banned:
        user.ban_reason = payload.ban_reason
    else:
        user.ban_reason = None
    
    new_status = "Banned" if user.is_banned else "Active"
    db.commit()
    
    # Audit Log: User Status Change
    record_audit_log(
        db, 
        "user_status_change", 
        current_admin.id, 
        "admin", 
        current_admin.username, 
        f"Admin {'banned' if user.is_banned else 'unbanned'} user: {user.username}. Reason: {user.ban_reason or 'N/A'}", 
        target_id=user.id, 
        target_type="user", 
        request=req
    )
    
    return {
        "message": f"User {'banned' if user.is_banned else 'unbanned'} successfully", 
        "is_active": user.is_active,
        "is_banned": user.is_banned
    }
