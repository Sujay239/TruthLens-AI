from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import database, models, schemas, dependencies
from sqlalchemy import desc
from datetime import datetime, timedelta
from app.utils.audit_utils import record_audit_log

router = APIRouter(
    prefix="/admin/audit",
    tags=["Admin Audit Logs"]
)

@router.get("/logs", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin),
    skip: int = 0,
    limit: int = 100,
    actor_type: Optional[str] = None,
    action: Optional[str] = None,
    status: Optional[str] = None
):
    query = db.query(models.AuditLog)
    
    if actor_type:
        query = query.filter(models.AuditLog.actor_type == actor_type)
    
    if action:
        query = query.filter(models.AuditLog.action.contains(action))

    if status:
        query = query.filter(models.AuditLog.status == status)
        
    logs = query.order_by(desc(models.AuditLog.created_at)).offset(skip).limit(limit).all()
    return logs

@router.delete("/clear", response_model=dict)
def clear_audit_logs(
    req: Request,
    time_range: str = Query(..., description="Time range to clear: 24h, 7days, 15days, 30days, all"),
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin)
):
    valid_ranges = ["24h", "7days", "15days", "30days", "all"]
    if time_range not in valid_ranges:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid time range. Must be one of {valid_ranges}"
        )
        
    now = datetime.utcnow()
    query = db.query(models.AuditLog)
    
    if time_range == "24h":
        cutoff = now - timedelta(hours=24)
        deleted_count = query.filter(models.AuditLog.created_at >= cutoff).delete()
    elif time_range == "7days":
        cutoff = now - timedelta(days=7)
        deleted_count = query.filter(models.AuditLog.created_at >= cutoff).delete()
    elif time_range == "15days":
        cutoff = now - timedelta(days=15)
        deleted_count = query.filter(models.AuditLog.created_at >= cutoff).delete()
    elif time_range == "30days":
        cutoff = now - timedelta(days=30)
        deleted_count = query.filter(models.AuditLog.created_at >= cutoff).delete()
    elif time_range == "all":
        deleted_count = query.delete()
        
    db.commit()
    
    # Record the clear action in the audit log so the clear itself is audited
    record_audit_log(
        db=db,
        action="audit_logs_clear",
        actor_id=current_admin.id,
        actor_type="admin",
        actor_username=current_admin.username,
        description=f"Cleared audit logs for time range: {time_range} (Deleted {deleted_count} logs)",
        status="success",
        request=req
    )
    
    return {"status": "success", "message": f"Successfully cleared {deleted_count} logs for range: {time_range}"}
