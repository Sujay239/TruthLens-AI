from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import database, models, schemas, dependencies
from sqlalchemy import desc

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
