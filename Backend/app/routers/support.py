from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app import database, models, schemas, email_utils, email_templates
import os

router = APIRouter(
    prefix="/support",
    tags=["Support"]
)

@router.post("/submit")
async def submit_support_ticket(
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

    # 2. Get all admin emails
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
