from sqlalchemy.orm import Session
from fastapi import Request
from .. import models
from typing import Optional

def record_audit_log(
    db: Session,
    action: str,
    actor_id: Optional[int],
    actor_type: str,
    actor_username: str,
    description: str,
    target_id: Optional[int] = None,
    target_type: Optional[str] = None,
    status: str = "success",
    request: Optional[Request] = None
):
    ip_address = None
    user_agent = None
    
    if request:
        # Check for X-Forwarded-For if behind a proxy
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            ip_address = forwarded_for.split(",")[0]
        else:
            ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        
    db_log = models.AuditLog(
        action=action,
        actor_id=actor_id,
        actor_type=actor_type,
        actor_username=actor_username,
        target_id=target_id,
        target_type=target_type,
        description=description,
        status=status,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
