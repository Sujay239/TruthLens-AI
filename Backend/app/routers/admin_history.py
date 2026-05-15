from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import database, models, schemas, dependencies

router = APIRouter(
    prefix="/admin/history",
    tags=["Admin History"],
)


@router.get("/", response_model=List[schemas.AdminAnalysisLogResponse])
def get_all_history(
    scan_type: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin),
):
    # Mapping of frontend types to scan_type in database
    type_map = {
        "News": "fake_news",
        "Image": "image",
        "Video": "video",
        "Audio": "audio",
        "Text": "ai_text",
        "Malware": "malware"
    }

    selected_type = type_map.get(scan_type)

    if selected_type:
        # Query specific tables if a filter is applied
        if selected_type == "fake_news":
            items = (
                db.query(models.FakeNewsScan, models.User)
                .join(models.User, models.FakeNewsScan.user_id == models.User.id)
                .order_by(models.FakeNewsScan.created_at.desc())
                .all()
            )
            result = []
            for scan, user in items:
                result.append({
                    "id": scan.id, # Note: this is the scan ID, but schema expects an ID
                    "filename": "Text Snippet", # Default for news
                    "file_type": "Text",
                    "result_label": scan.label,
                    "confidence_score": scan.confidence_score,
                    "date_created": scan.created_at,
                    "file_size": f"{len(scan.content_text)} chars",
                    "media_url": None,
                    "scan_type": "fake_news",
                    "scan_id": scan.id,
                    "analysis_summary": {"content": scan.content_text},
                    "user_id": user.id,
                    "user_name": user.username or user.email,
                    "user_email": user.email,
                })
            return result
        
        elif selected_type == "image":
            items = (
                db.query(models.ImageScan, models.User)
                .join(models.User, models.ImageScan.user_id == models.User.id)
                .order_by(models.ImageScan.created_at.desc())
                .all()
            )
            result = []
            for scan, user in items:
                result.append({
                    "id": scan.id,
                    "filename": scan.image_url.split("/")[-1] if scan.image_url else "image.jpg",
                    "file_type": "Image",
                    "result_label": scan.label,
                    "confidence_score": scan.confidence_score,
                    "date_created": scan.created_at,
                    "file_size": "N/A",
                    "media_url": scan.image_url,
                    "scan_type": "image",
                    "scan_id": scan.id,
                    "analysis_summary": None,
                    "user_id": user.id,
                    "user_name": user.username or user.email,
                    "user_email": user.email,
                })
            return result

        elif selected_type == "video":
            items = (
                db.query(models.VideoScan, models.User)
                .join(models.User, models.VideoScan.user_id == models.User.id)
                .order_by(models.VideoScan.created_at.desc())
                .all()
            )
            result = []
            for scan, user in items:
                result.append({
                    "id": scan.id,
                    "filename": scan.video_url.split("/")[-1] if scan.video_url else "video.mp4",
                    "file_type": "Video",
                    "result_label": scan.label,
                    "confidence_score": scan.confidence_score,
                    "date_created": scan.created_at,
                    "file_size": "N/A",
                    "media_url": scan.video_url,
                    "scan_type": "video",
                    "scan_id": scan.id,
                    "analysis_summary": None,
                    "user_id": user.id,
                    "user_name": user.username or user.email,
                    "user_email": user.email,
                })
            return result

        elif selected_type == "audio":
            items = (
                db.query(models.AudioScan, models.User)
                .join(models.User, models.AudioScan.user_id == models.User.id)
                .order_by(models.AudioScan.created_at.desc())
                .all()
            )
            result = []
            for scan, user in items:
                result.append({
                    "id": scan.id,
                    "filename": scan.audio_url.split("/")[-1] if scan.audio_url else "audio.mp3",
                    "file_type": "Audio",
                    "result_label": scan.label,
                    "confidence_score": scan.confidence_score,
                    "date_created": scan.created_at,
                    "file_size": "N/A",
                    "media_url": scan.audio_url,
                    "scan_type": "audio",
                    "scan_id": scan.id,
                    "analysis_summary": None,
                    "user_id": user.id,
                    "user_name": user.username or user.email,
                    "user_email": user.email,
                })
            return result

        elif selected_type == "ai_text":
            items = (
                db.query(models.AiTextScan, models.User)
                .join(models.User, models.AiTextScan.user_id == models.User.id)
                .order_by(models.AiTextScan.created_at.desc())
                .all()
            )
            result = []
            for scan, user in items:
                result.append({
                    "id": scan.id,
                    "filename": "Text Snippet",
                    "file_type": "Text",
                    "result_label": scan.label,
                    "confidence_score": scan.confidence_score,
                    "date_created": scan.created_at,
                    "file_size": f"{len(scan.content_text)} chars",
                    "media_url": None,
                    "scan_type": "ai_text",
                    "scan_id": scan.id,
                    "analysis_summary": {"content": scan.content_text},
                    "user_id": user.id,
                    "user_name": user.username or user.email,
                    "user_email": user.email,
                })
            return result

        elif selected_type == "malware":
            items = (
                db.query(models.MalwareScan, models.User)
                .join(models.User, models.MalwareScan.user_id == models.User.id)
                .order_by(models.MalwareScan.created_at.desc())
                .all()
            )
            result = []
            for scan, user in items:
                result.append({
                    "id": scan.id,
                    "filename": scan.target,
                    "file_type": "Malware",
                    "result_label": scan.label,
                    "confidence_score": float(scan.threat_score),
                    "date_created": scan.created_at,
                    "file_size": "N/A",
                    "media_url": None,
                    "scan_type": "malware",
                    "scan_id": scan.id,
                    "analysis_summary": {"content": scan.analysis_text},
                    "user_id": user.id,
                    "user_name": user.username or user.email,
                    "user_email": user.email,
                })
            return result

    # Default: Return unified logs (for "All" or if no scan_type)
    logs = (
        db.query(models.AnalysisLog, models.User)
        .join(models.User, models.AnalysisLog.user_id == models.User.id)
        .order_by(models.AnalysisLog.date_created.desc())
        .all()
    )

    result = []
    for log, user in logs:
        result.append({
            "id": log.id,
            "filename": log.filename,
            "file_type": log.file_type,
            "result_label": log.result_label,
            "confidence_score": log.confidence_score,
            "date_created": log.date_created,
            "file_size": log.file_size,
            "media_url": log.media_url,
            "scan_type": log.scan_type,
            "scan_id": log.scan_id,
            "analysis_summary": log.analysis_summary,
            "user_id": user.id,
            "user_name": user.username or user.email,
            "user_email": user.email,
        })

    return result
