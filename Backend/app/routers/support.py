from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy.orm import Session
from typing import List
from app import database, models, schemas, email_utils, email_templates, dependencies
from app.utils.audit_utils import record_audit_log
import os

router = APIRouter(
    prefix="/support",
    tags=["Support"]
)

@router.post("/submit")
async def submit_support_ticket(
    req: Request,
    ticket: schemas.SupportTicketCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db)
):
    # 1. Save to Database
    db_ticket = models.SupportTicket(
        full_name=ticket.full_name,
        email=ticket.email,
        phone_number=ticket.phone_number,
        reason=ticket.reason,
        message=ticket.message
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    
    # Audit Log: Support Ticket Submission
    record_audit_log(
        db, 
        "ticket_submit", 
        None, 
        "user", 
        ticket.full_name, 
        f"New support ticket submitted by {ticket.full_name} ({ticket.email}): {ticket.reason}", 
        target_id=db_ticket.id, 
        target_type="ticket", 
        request=req
    )

    # 2. Get all admin emails
    # ... (rest of the function unchanged)
    admin_emails = [admin.email for admin in db.query(models.Admin).all()]
    
    # Ticket info for templates
    ticket_info = {
        "full_name": ticket.full_name,
        "email": ticket.email,
        "phone_number": ticket.phone_number or "Not provided",
        "reason": ticket.reason,
        "message": ticket.message
    }

    # 3. Send email to admins
    if admin_emails:
        admin_html = email_templates.get_admin_support_notification_template(ticket_info)
        
        background_tasks.add_task(
            email_utils.send_email,
            subject=f"New Support Ticket: {ticket.reason}",
            recipients=admin_emails,
            body=admin_html
        )

    # 4. Send confirmation email to the user
    user_html = email_templates.get_user_support_confirmation_template(ticket_info)
    
    background_tasks.add_task(
        email_utils.send_email,
        subject="We've received your support request - TruthLens AI",
        recipients=[ticket.email],
        body=user_html
    )

    return {"message": "Support ticket submitted successfully. Our team will contact you soon.", "ticket_id": db_ticket.id}

@router.get("/", response_model=List[schemas.SupportTicketResponse])
def get_all_tickets(
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin)
):
    """
    Get all support tickets (Admin only).
    """
    return db.query(models.SupportTicket).order_by(models.SupportTicket.created_at.desc()).all()

@router.put("/{ticket_id}", response_model=schemas.SupportTicketResponse)
async def update_ticket_status(
    ticket_id: int,
    req: Request,
    status_update: schemas.SupportTicketStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin)
):
    """
    Update support ticket status and notify user (Admin only).
    """
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    old_status = ticket.status
    ticket.status = status_update.status
    if status_update.status == "Rejected":
        ticket.rejection_reason = status_update.rejection_reason
    
    db.commit()
    db.refresh(ticket)
    
    # Audit Log: Support Ticket Status Update
    record_audit_log(
        db, 
        "ticket_status_update", 
        current_admin.id, 
        "admin", 
        current_admin.username, 
        f"Admin changed ticket #{ticket.id} status from {old_status} to {ticket.status}", 
        target_id=ticket.id, 
        target_type="ticket", 
        request=req
    )

    # Send email if status is Solved or Rejected
    # ... (rest of the function unchanged)
    if status_update.status in ["Solved", "Rejected"]:
        subject = ""
        html_content = ""
        
        ticket_info = {
            "full_name": ticket.full_name,
            "reason": ticket.reason,
            "rejection_reason": ticket.rejection_reason
        }

        if status_update.status == "Solved":
            subject = "Support Request Resolved - TruthLens AI"
            html_content = email_templates.get_support_resolved_template(ticket_info)
        else:
            subject = "Support Request Update - TruthLens AI"
            html_content = email_templates.get_support_rejected_template(ticket_info)

        background_tasks.add_task(
            email_utils.send_email,
            subject=subject,
            recipients=[ticket.email],
            body=html_content
        )

    return ticket
