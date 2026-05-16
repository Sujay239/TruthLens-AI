from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas, dependencies, utils
from app.utils.audit_utils import record_audit_log
import shutil, os
from datetime import datetime

router = APIRouter(
    prefix="/admin/manage",
    tags=["Admin Management"]
)

@router.get("/", response_model=List[schemas.AdminFullResponse])
def get_all_admins(
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin),
):
    """
    Retrieve all administrators.
    """
    admins = db.query(models.Admin).all()
    return admins

@router.post("/", response_model=schemas.AdminFullResponse)
def create_admin(
    req: Request,
    admin_in: schemas.AdminCreate,
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin),
):
    """
    Create a new administrator.
    """
    # Check if username already exists
    existing_user = db.query(models.Admin).filter(
        (models.Admin.username == admin_in.username) | 
        (models.Admin.email == admin_in.email)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin with this username or email already exists"
        )
    
    new_admin = models.Admin(
        username=admin_in.username,
        email=admin_in.email,
        hashed_password=utils.get_password_hash(admin_in.password),
        full_name=admin_in.full_name,
        pin=admin_in.pin
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    # Audit Log: Admin Creation
    record_audit_log(db, "admin_create", current_admin.id, "admin", current_admin.username, f"Admin created a new admin account: {new_admin.username}", target_id=new_admin.id, target_type="admin", request=req)
    
    return new_admin

@router.put("/{admin_id}", response_model=schemas.AdminFullResponse)
def update_admin(
    admin_id: int,
    req: Request,
    admin_in: schemas.AdminUpdate,
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin),
):
    """
    Update an administrator's details.
    """
    admin = db.query(models.Admin).filter(models.Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    if admin_in.email:
        admin.email = admin_in.email
    if admin_in.full_name:
        admin.full_name = admin_in.full_name
    if admin_in.password:
        admin.hashed_password = utils.get_password_hash(admin_in.password)
    if admin_in.pin:
        admin.pin = admin_in.pin
        
    db.commit()
    db.refresh(admin)
    
    # Audit Log: Admin Update
    record_audit_log(db, "admin_update", current_admin.id, "admin", current_admin.username, f"Admin updated admin account: {admin.username}", target_id=admin.id, target_type="admin", request=req)
    
    return admin

@router.delete("/{admin_id}")
def delete_admin(
    admin_id: int,
    req: Request,
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin),
):
    """
    Delete an administrator.
    """
    # Prevent self-deletion
    if admin_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own admin account"
        )
    
    # Prevent deleting the last admin
    admin_count = db.query(models.Admin).count()
    if admin_count <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete the last remaining administrator"
        )
        
    admin = db.query(models.Admin).filter(models.Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    # Prevent deleting the Project Leader (Sujay2008)
    if admin.username == "Sujay2008":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete the Project Leader account"
        )
    
    admin_username = admin.username
    admin_id_val = admin.id
    
    db.delete(admin)
    db.commit()
    
    # Audit Log: Admin Deletion
    record_audit_log(db, "admin_delete", current_admin.id, "admin", current_admin.username, f"Admin deleted admin account: {admin_username}", target_id=admin_id_val, target_type="admin", request=req)
    
    return {"message": "Admin deleted successfully"}

# ─── Self-service profile & security endpoints ───────────────────────────────

@router.patch("/me", response_model=schemas.AdminFullResponse)
def update_my_profile(
    req: Request,
    profile_in: schemas.AdminProfileUpdate,
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin),
):
    """
    Update the currently logged-in admin's profile info.
    """
    if profile_in.email:
        # check uniqueness
        existing = db.query(models.Admin).filter(
            models.Admin.email == profile_in.email,
            models.Admin.id != current_admin.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already used by another account")
        current_admin.email = profile_in.email
    if profile_in.full_name is not None:
        current_admin.full_name = profile_in.full_name
    db.commit()
    db.refresh(current_admin)
    
    # Audit Log: Profile Update
    record_audit_log(db, "admin_profile_update", current_admin.id, "admin", current_admin.username, f"Admin updated their profile", target_id=current_admin.id, target_type="admin", request=req)
    
    return current_admin

@router.patch("/me/password")
def change_my_password(
    req: Request,
    body: schemas.AdminPasswordChange,
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin),
):
    """
    Change password. Requires current password for verification.
    """
    if not utils.verify_password(body.current_password, current_admin.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_admin.hashed_password = utils.get_password_hash(body.new_password)
    db.commit()
    
    # Audit Log: Password Change
    record_audit_log(db, "admin_password_change", current_admin.id, "admin", current_admin.username, f"Admin changed their password", target_id=current_admin.id, target_type="admin", request=req)
    
    return {"message": "Password updated successfully"}

@router.patch("/me/pin")
def change_my_pin(
    req: Request,
    body: schemas.AdminPinChange,
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin),
):
    """
    Change PIN. Requires current PIN for verification.
    """
    if current_admin.pin != body.current_pin:
        raise HTTPException(status_code=400, detail="Current PIN is incorrect")
    if not body.new_pin.isdigit() or len(body.new_pin) < 4:
        raise HTTPException(status_code=400, detail="PIN must be at least 4 digits")
    current_admin.pin = body.new_pin
    db.commit()
    
    # Audit Log: PIN Change
    record_audit_log(db, "admin_pin_change", current_admin.id, "admin", current_admin.username, f"Admin changed their PIN", target_id=current_admin.id, target_type="admin", request=req)
    
    return {"message": "PIN updated successfully"}

@router.post("/me/pin/verify")
def verify_my_pin(
    req: Request,
    body: schemas.AdminSelfPinVerify,
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin),
):
    """
    Verify the current admin's PIN.
    """
    if current_admin.pin != body.pin:
        raise HTTPException(status_code=400, detail="Current PIN is incorrect")
    
    # Audit Log: PIN Verification
    record_audit_log(db, "admin_pin_verify", current_admin.id, "admin", current_admin.username, f"Admin verified their PIN for a sensitive action", target_id=current_admin.id, target_type="admin", request=req)
    
    return {"message": "PIN verified successfully"}

@router.post("/me/avatar", response_model=schemas.AdminFullResponse)
async def upload_admin_avatar(
    req: Request,
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin),
):
    """
    Upload or replace the logged-in admin's avatar image.
    """
    UPLOAD_DIR = "uploads/avatars"
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_ext = (file.filename or "jpg").rsplit(".", 1)[-1].lower()
    if file_ext not in {"jpg", "jpeg", "png", "webp", "gif"}:
        raise HTTPException(status_code=400, detail="Only image files are allowed (jpg, png, webp, gif)")

    filename = f"admin_{current_admin.id}_{int(datetime.utcnow().timestamp())}.{file_ext}"
    file_path = f"{UPLOAD_DIR}/{filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    current_admin.avatar = f"http://localhost:8000/uploads/avatars/{filename}"
    db.commit()
    db.refresh(current_admin)
    
    # Audit Log: Avatar Upload
    record_audit_log(db, "admin_avatar_upload", current_admin.id, "admin", current_admin.username, f"Admin uploaded a new avatar", target_id=current_admin.id, target_type="admin", request=req)
    
    return current_admin
