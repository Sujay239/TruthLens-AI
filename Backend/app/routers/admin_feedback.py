from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas, dependencies
from sqlalchemy import func

router = APIRouter(
    prefix="/admin/feedback",
    tags=["Admin Feedback"]
)

@router.get("/", response_model=List[schemas.AdminFeedbackResponse])
def get_all_feedbacks(
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin),
):
    feedbacks = (
        db.query(models.ScanFeedback, models.User, models.AnalysisLog)
        .join(models.User, models.ScanFeedback.user_id == models.User.id)
        .join(models.AnalysisLog, models.ScanFeedback.analysis_log_id == models.AnalysisLog.id)
        .order_by(models.ScanFeedback.created_at.desc())
        .all()
    )

    result = []
    for feedback, user, log in feedbacks:
        result.append({
            "id": feedback.id,
            "analysis_log_id": feedback.analysis_log_id,
            "scan_type": feedback.scan_type,
            "scan_id": feedback.scan_id,
            "rating": feedback.rating,
            "message": feedback.message,
            "corrected_label": feedback.corrected_label,
            "model_processed": feedback.model_processed,
            "created_at": feedback.created_at,
            "user_name": user.username or user.email,
            "user_email": user.email,
            "filename": log.filename,
            "predicted_label": log.result_label,
            "confidence_score": log.confidence_score
        })
    return result

@router.get("/overview", response_model=schemas.FeedbackManagementOverview)
def get_feedback_overview(
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin),
):
    total_feedbacks = db.query(models.ScanFeedback).count()
    processed_feedbacks = db.query(models.ScanFeedback).filter(models.ScanFeedback.model_processed == True).count()
    pending_feedbacks = total_feedbacks - processed_feedbacks
    
    likes_total = db.query(models.ScanFeedback).filter(models.ScanFeedback.rating == "like").count()
    dislikes_total = db.query(models.ScanFeedback).filter(models.ScanFeedback.rating == "dislike").count()
    
    learning_stats = db.query(models.FeedbackLearningStat).all()
    
    return {
        "total_feedbacks": total_feedbacks,
        "processed_feedbacks": processed_feedbacks,
        "pending_feedbacks": pending_feedbacks,
        "likes_total": likes_total,
        "dislikes_total": dislikes_total,
        "learning_stats": learning_stats
    }

@router.post("/{feedback_id}/process")
def process_feedback(
    feedback_id: int,
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin),
):
    feedback = db.query(models.ScanFeedback).filter(models.ScanFeedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    feedback.model_processed = True
    db.commit()
    return {"message": "Feedback marked as processed for model training"}
