from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models, schemas, dependencies
from typing import List
from datetime import datetime, timedelta
from sqlalchemy import func

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

REAL_LABELS = ["real", "clean", "human written", "authentic"]
RISK_LABELS = [
    "fake",
    "deepfake",
    "ai generated",
    "malicious",
    "suspicious",
    "manipulated",
    "likely fake",
]

@router.get("/overview", response_model=schemas.DashboardOverview)
async def get_dashboard_overview(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    # 1. Calculate Stats
    total_scans = db.query(models.AnalysisLog).filter(models.AnalysisLog.user_id == current_user.id).count()
    real_scans = db.query(models.AnalysisLog).filter(
        models.AnalysisLog.user_id == current_user.id,
        models.AnalysisLog.result_label == "Real"
    ).count()
    fake_scans = db.query(models.AnalysisLog).filter(
        models.AnalysisLog.user_id == current_user.id,
        models.AnalysisLog.result_label == "Fake"  # Or "Deepfake" depending on your logic
    ).count()

    # Calculate change (dummy logic for now, or compare with last month)
    # real_change = "+8.2%" # You could query last month's count to calc this

    stats = [
        schemas.DashboardStats(
            title="Total Scans",
            value=f"{total_scans}",
            change="+0%", # To be implemented with time-based query
            icon_type="activity"
        ),
        schemas.DashboardStats(
            title="Real Content",
            value=f"{real_scans}",
            change="+0%",
            icon_type="check"
        ),
        schemas.DashboardStats(
            title="Fake Detected",
            value=f"{fake_scans}",
            change="+0%",
            icon_type="alert"
        )
    ]

    # 2. Chart Data (Last 7 Days)
    today = datetime.utcnow().date()
    days_map = {}
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        days_map[day.strftime("%a")] = 0

    # Aggregate counts by day
    logs_last_7_days = db.query(models.AnalysisLog).filter(
        models.AnalysisLog.user_id == current_user.id,
        models.AnalysisLog.date_created >= datetime.utcnow() - timedelta(days=7)
    ).all()

    for log in logs_last_7_days:
        day_str = log.date_created.strftime("%a")
        if day_str in days_map:
            days_map[day_str] += 1

    chart_data = [schemas.ChartData(name=day, scans=count) for day, count in days_map.items()]


    # 3. Pie Data
    pie_data = [
        schemas.PieData(name="Real", value=real_scans),
        schemas.PieData(name="Fake", value=fake_scans)
    ]

    # 4. Recent Activity
    recent_logs = db.query(models.AnalysisLog).filter(
        models.AnalysisLog.user_id == current_user.id
    ).order_by(models.AnalysisLog.date_created.desc()).limit(5).all()

    recent_activity = []
    for log in recent_logs:
        # Determine status color/text from label
        status = log.result_label if log.result_label else "Unknown"

        # Calculate relative time
        diff = datetime.utcnow() - log.date_created
        if diff.days > 0:
            date_str = f"{diff.days}d ago"
        elif diff.seconds > 3600:
            date_str = f"{diff.seconds // 3600}h ago"
        elif diff.seconds > 60:
            date_str = f"{diff.seconds // 60}m ago"
        else:
            date_str = "Just now"

        recent_activity.append(
            schemas.RecentActivityItem(
                id=log.id,
                type=log.file_type.lower() if log.file_type else "unknown",
                name=log.filename if log.filename else "Untitled",
                status=status,
                date=date_str,
                confidence=f"{log.confidence_score:.1f}%" if log.confidence_score > 1 else f"{log.confidence_score * 100:.1f}%" if log.confidence_score else "N/A"
            )
        )

    return schemas.DashboardOverview(
        stats=stats,
        chart_data=chart_data,
        pie_data=pie_data,
        recent_activity=recent_activity
    )


@router.get("/admin-overview", response_model=schemas.AdminDashboardOverview)
def get_admin_dashboard_overview(
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin),
):
    # Tables to aggregate from
    scan_tables = [
        ("News", models.FakeNewsScan),
        ("Text", models.AiTextScan),
        ("Image", models.ImageScan),
        ("Video", models.VideoScan),
        ("Audio", models.AudioScan),
        ("Malware", models.MalwareScan),
    ]

    total_scans = 0
    total_real_detected = 0
    total_fake_detected = 0
    scan_type_breakdown = []

    for label, model in scan_tables:
        count = db.query(model).count()
        total_scans += count
        scan_type_breakdown.append(schemas.AdminScanTypeData(name=label, scans=count))

        # Count Real vs Fake in this table
        # We need to handle label column name (most use .label, malware uses .label too)
        # Note: func.lower for case-insensitive matching
        normalized_label = func.lower(model.label)
        
        real_count = db.query(model).filter(normalized_label.in_(REAL_LABELS)).count()
        fake_count = db.query(model).filter(normalized_label.in_(RISK_LABELS)).count()
        
        total_real_detected += real_count
        total_fake_detected += fake_count

    total_users = db.query(models.User).count()

    happy_feedback = db.query(models.ScanFeedback).filter(
        models.ScanFeedback.rating == "like"
    ).count()
    unhappy_feedback = db.query(models.ScanFeedback).filter(
        models.ScanFeedback.rating == "dislike"
    ).count()

    total_feedback = happy_feedback + unhappy_feedback
    happy_feedback_rate = (
        (happy_feedback / total_feedback) * 100 if total_feedback else 0.0
    )

    # For recent activity, we still use AnalysisLog as it's a unified chronological stream
    # If some entries are missing from AnalysisLog, they won't show here, 
    # but fixing this would require a complex UNION of all tables.
    recent_logs = (
        db.query(models.AnalysisLog, models.User)
        .join(models.User, models.AnalysisLog.user_id == models.User.id)
        .order_by(models.AnalysisLog.date_created.desc())
        .limit(5)
        .all()
    )

    recent_activity = []
    for log, user in recent_logs:
        recent_activity.append(
            schemas.AdminRecentActivityItem(
                id=log.id,
                user_name=user.username or user.email or "Unknown",
                file_type=(log.file_type or "Unknown").capitalize(),
                result_label=log.result_label or "Unknown",
                date=log.date_created,
                confidence=float(log.confidence_score or 0.0),
            )
        )

    return schemas.AdminDashboardOverview(
        total_scans=total_scans,
        total_users=total_users,
        total_real_detected=total_real_detected,
        total_fake_detected=total_fake_detected,
        happy_feedback=happy_feedback,
        unhappy_feedback=unhappy_feedback,
        happy_feedback_rate=happy_feedback_rate,
        scan_type_breakdown=scan_type_breakdown,
        real_vs_fake=[
            schemas.AdminScanTypeData(name="Real", scans=total_real_detected),
            schemas.AdminScanTypeData(name="Fake", scans=total_fake_detected),
        ],
        recent_activity=recent_activity,
    )
