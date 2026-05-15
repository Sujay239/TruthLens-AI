from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import database, dependencies, models, schemas
from ..ml.feedback_learning import MODEL_SCAN_TYPES, normalize_scan_type, record_feedback_signal


router = APIRouter(
    prefix="/feedback",
    tags=["Feedback"],
)


def process_feedback_signal(feedback_id: int) -> None:
    db = database.SessionLocal()
    try:
        record_feedback_signal(db, feedback_id)
    finally:
        db.close()


@router.post("/", response_model=schemas.FeedbackResponse, status_code=status.HTTP_201_CREATED)
def create_feedback(
    request: schemas.FeedbackCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user),
):
    log = (
        db.query(models.AnalysisLog)
        .filter(
            models.AnalysisLog.id == request.analysis_log_id,
            models.AnalysisLog.user_id == current_user.id,
        )
        .first()
    )
    if not log:
        raise HTTPException(status_code=404, detail="Analysis record not found")
    if not log.scan_type or not log.scan_id:
        raise HTTPException(
            status_code=400,
            detail="This analysis record cannot accept feedback because it is missing scan metadata.",
        )
    try:
        scan_type = normalize_scan_type(log.scan_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Unsupported scan type for feedback.")

    feedback = models.ScanFeedback(
        user_id=current_user.id,
        analysis_log_id=log.id,
        scan_type=scan_type,
        scan_id=log.scan_id,
        rating=request.rating,
        message=(request.message or "").strip() or None,
        corrected_label=(request.corrected_label or "").strip() or None,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    background_tasks.add_task(process_feedback_signal, feedback.id)
    return feedback


@router.get("/analysis/{analysis_log_id}", response_model=List[schemas.FeedbackResponse])
def get_feedback_for_analysis(
    analysis_log_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user),
):
    log = (
        db.query(models.AnalysisLog)
        .filter(
            models.AnalysisLog.id == analysis_log_id,
            models.AnalysisLog.user_id == current_user.id,
        )
        .first()
    )
    if not log:
        raise HTTPException(status_code=404, detail="Analysis record not found")

    return (
        db.query(models.ScanFeedback)
        .filter(
            models.ScanFeedback.analysis_log_id == analysis_log_id,
            models.ScanFeedback.user_id == current_user.id,
        )
        .order_by(models.ScanFeedback.created_at.desc())
        .all()
    )


@router.get("/learning-stats", response_model=List[schemas.FeedbackLearningStatResponse])
def get_feedback_learning_stats(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user),
):
    stats = (
        db.query(models.FeedbackLearningStat)
        .order_by(
            models.FeedbackLearningStat.scan_type.asc(),
            models.FeedbackLearningStat.predicted_label.asc(),
        )
        .all()
    )

    return [
        {
            "scan_type": stat.scan_type,
            "model_name": MODEL_SCAN_TYPES.get(stat.scan_type, stat.scan_type),
            "predicted_label": stat.predicted_label,
            "likes": stat.likes or 0,
            "dislikes": stat.dislikes or 0,
            "correction_label": stat.correction_label,
            "correction_count": stat.correction_count or 0,
            "confidence_adjustment": stat.confidence_adjustment or 0.0,
            "total_feedback": (stat.likes or 0) + (stat.dislikes or 0),
            "updated_at": stat.updated_at,
        }
        for stat in stats
    ]
