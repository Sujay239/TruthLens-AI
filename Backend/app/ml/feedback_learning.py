from sqlalchemy.orm import Session
from typing import Optional
from .. import models

MODEL_SCAN_TYPES = {
    "fake_news": "Fake News Model",
    "image": "Deepfake Image Model",
    "video": "Deepfake Video Model",
    "audio": "Deepfake Voice Model",
    "ai_text": "AI Text Model",
    "malware": "Malware Scanner",
}


def normalize_label(label: Optional[str]) -> str:
    return (label or "").strip().lower()


def normalize_scan_type(scan_type: Optional[str]) -> str:
    normalized = (scan_type or "").strip().lower()
    if normalized not in MODEL_SCAN_TYPES:
        raise ValueError(f"Unsupported feedback scan_type: {scan_type}")
    return normalized


def get_or_create_stat(db: Session, scan_type: str, predicted_label: str) -> models.FeedbackLearningStat:
    scan_type = normalize_scan_type(scan_type)
    stat = (
        db.query(models.FeedbackLearningStat)
        .filter(
            models.FeedbackLearningStat.scan_type == scan_type,
            models.FeedbackLearningStat.predicted_label == predicted_label,
        )
        .first()
    )
    if stat:
        return stat

    stat = models.FeedbackLearningStat(
        scan_type=scan_type,
        predicted_label=predicted_label,
        likes=0,
        dislikes=0,
        correction_count=0,
        confidence_adjustment=0.0,
    )
    db.add(stat)
    db.flush()
    return stat


def record_feedback_signal(db: Session, feedback_id: int) -> None:
    feedback = db.query(models.ScanFeedback).filter(models.ScanFeedback.id == feedback_id).first()
    if not feedback or feedback.model_processed:
        return

    scan_type = normalize_scan_type(feedback.scan_type)

    log = (
        db.query(models.AnalysisLog)
        .filter(models.AnalysisLog.id == feedback.analysis_log_id)
        .first()
    )
    if not log:
        return
    if normalize_scan_type(log.scan_type) != scan_type or log.scan_id != feedback.scan_id:
        raise ValueError("Feedback does not match the original scan metadata.")

    stat = get_or_create_stat(db, scan_type, log.result_label)
    if feedback.rating == "like":
        stat.likes = (stat.likes or 0) + 1
    else:
        stat.dislikes = (stat.dislikes or 0) + 1

    corrected_label = (feedback.corrected_label or "").strip()
    if corrected_label and normalize_label(corrected_label) != normalize_label(log.result_label):
        stat.correction_label = corrected_label
        stat.correction_count = (stat.correction_count or 0) + 1

    total = max((stat.likes or 0) + (stat.dislikes or 0), 1)
    disagreement_rate = (stat.dislikes or 0) / total
    agreement_rate = (stat.likes or 0) / total

    if total >= 3:
        stat.confidence_adjustment = round((agreement_rate - disagreement_rate) * 8.0, 2)
    else:
        stat.confidence_adjustment = 0.0

    feedback.model_processed = True
    db.add(feedback)
    db.add(stat)
    db.commit()


def apply_feedback_calibration(
    db: Session,
    scan_type: str,
    label: str,
    confidence: float,
) -> tuple[str, float, dict]:
    scan_type = normalize_scan_type(scan_type)
    stat = (
        db.query(models.FeedbackLearningStat)
        .filter(
            models.FeedbackLearningStat.scan_type == scan_type,
            models.FeedbackLearningStat.predicted_label == label,
        )
        .first()
    )
    if not stat:
        return label, confidence, {}

    calibrated_label = label
    calibrated_confidence = max(0.0, min(100.0, confidence + (stat.confidence_adjustment or 0.0)))

    # Relabel only after repeated negative feedback with a consistent correction.
    if (
        (stat.dislikes or 0) >= 5
        and (stat.dislikes or 0) > ((stat.likes or 0) * 2)
        and (stat.correction_count or 0) >= 3
        and stat.correction_label
    ):
        calibrated_label = stat.correction_label
        calibrated_confidence = min(calibrated_confidence, 65.0)

    return calibrated_label, calibrated_confidence, {
        "feedback_learning": {
            "likes": stat.likes or 0,
            "dislikes": stat.dislikes or 0,
            "confidence_adjustment": stat.confidence_adjustment or 0.0,
            "corrected_label": stat.correction_label,
        }
    }
