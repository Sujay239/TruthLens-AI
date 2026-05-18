import secrets
import hashlib
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
from sqlalchemy.orm import Session
from .. import models, schemas, database, dependencies
from app.utils.audit_utils import record_audit_log

router = APIRouter(
    prefix="/apikeys",
    tags=["API Keys"]
)

# 1. GET ALL API KEYS (Current User)
@router.get("/", response_model=List[schemas.APIKeyResponse])
def get_user_keys(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return db.query(models.APIKey).filter(
        models.APIKey.user_id == current_user.id
    ).order_by(models.APIKey.created_at.desc()).all()

# 2. GENERATE NEW API KEY (Current User)
@router.post("/", response_model=schemas.APIKeyCreatedResponse, status_code=status.HTTP_201_CREATED)
def generate_user_key(
    request: schemas.APIKeyCreate,
    req: Request,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    # Prefix
    prefix = "tl_live_"
    # Secure token
    token = secrets.token_hex(24)
    raw_key = f"{prefix}{token}"
    
    # Hash
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    
    # Calculate expiration
    expires_at = None
    if request.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=request.expires_in_days)
        
    db_key = models.APIKey(
        user_id=current_user.id,
        name=request.name,
        key_prefix=prefix,
        key_hash=key_hash,
        raw_key=raw_key,
        expires_at=expires_at,
        is_active=True
    )
    
    db.add(db_key)
    db.commit()
    db.refresh(db_key)
    
    # Record audit log
    record_audit_log(
        db=db,
        action="api_key_generate",
        actor_id=current_user.id,
        actor_type="user",
        actor_username=current_user.username,
        description=f"Generated new API Key: {db_key.name} (prefix: {prefix})",
        target_id=db_key.id,
        target_type="api_key",
        request=req
    )

    # Map model to response schema and inject the plain raw key
    return schemas.APIKeyCreatedResponse(
        id=db_key.id,
        name=db_key.name,
        key_prefix=db_key.key_prefix,
        created_at=db_key.created_at,
        expires_at=db_key.expires_at,
        is_active=db_key.is_active,
        last_used_at=db_key.last_used_at,
        raw_key=raw_key
    )

# 3. REVOKE API KEY (Current User)
@router.delete("/{id}", response_model=dict)
def revoke_user_key(
    id: int,
    req: Request,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    db_key = db.query(models.APIKey).filter(
        models.APIKey.id == id,
        models.APIKey.user_id == current_user.id
    ).first()
    
    if not db_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API Key not found or unauthorized"
        )
        
    db_key.is_active = False
    db.commit()

    # Record audit log
    record_audit_log(
        db=db,
        action="api_key_revoke",
        actor_id=current_user.id,
        actor_type="user",
        actor_username=current_user.username,
        description=f"Revoked API Key: {db_key.name} (id: {db_key.id})",
        target_id=db_key.id,
        target_type="api_key",
        request=req
    )

    return {"status": "success", "message": "API Key revoked successfully"}

# 4. GET ALL API KEYS WITH OWNER DETAILS (Admin Only)
@router.get("/admin", response_model=List[schemas.AdminAPIKeyResponse])
def get_all_keys_admin(
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin)
):
    keys = db.query(models.APIKey).all()
    results = []
    for key in keys:
        user = db.query(models.User).filter(models.User.id == key.user_id).first()
        results.append(
            schemas.AdminAPIKeyResponse(
                id=key.id,
                name=key.name,
                key_prefix=key.key_prefix,
                created_at=key.created_at,
                expires_at=key.expires_at,
                is_active=key.is_active,
                last_used_at=key.last_used_at,
                user_id=key.user_id,
                user_name=f"{user.first_name} {user.last_name}" if user and (user.first_name or user.last_name) else (user.username if user else "Unknown"),
                user_email=user.email if user else "Unknown"
            )
        )
    # Sort by created_at desc
    results.sort(key=lambda x: x.created_at, reverse=True)
    return results

# 5. REVOKE ANY API KEY (Admin Only)
@router.delete("/admin/{id}", response_model=dict)
def revoke_any_key_admin(
    id: int,
    req: Request,
    x_admin_password: str = Header(..., description="Admin password to confirm deletion"),
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin)
):
    # Verify administrator password
    from .. import utils
    if not utils.verify_password(x_admin_password, current_admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect administrator password"
        )

    db_key = db.query(models.APIKey).filter(models.APIKey.id == id).first()
    if not db_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API Key not found"
        )
        
    db_key.is_active = False
    db.commit()

    # Record audit log
    record_audit_log(
        db=db,
        action="admin_api_key_revoke",
        actor_id=current_admin.id,
        actor_type="admin",
        actor_username=current_admin.username,
        description=f"Admin revoked API Key: {db_key.name} (id: {db_key.id}, owned by user_id: {db_key.user_id})",
        target_id=db_key.id,
        target_type="api_key",
        request=req
    )

    return {"status": "success", "message": "API Key revoked by admin"}
