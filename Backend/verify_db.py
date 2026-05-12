import sys
import os
from sqlalchemy.orm import sessionmaker
from app.database import engine
from app import models

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def verify():
    db = SessionLocal()
    try:
        print("Checking last 5 FakeNewsScans...")
        scans = db.query(models.FakeNewsScan).order_by(models.FakeNewsScan.id.desc()).limit(5).all()
        for scan in scans:
            print(f"ID: {scan.id}, Label: {scan.label}, Confidence: {scan.confidence_score}, Analysis: {scan.analysis_text[:50]}...")
            
        print("\nChecking last 5 AnalysisLogs...")
        logs = db.query(models.AnalysisLog).order_by(models.AnalysisLog.id.desc()).limit(5).all()
        for log in logs:
            print(f"ID: {log.id}, Filename: {log.filename}, Label: {log.result_label}, Confidence: {log.confidence_score}")
            if log.analysis_summary:
                print(f"Summary keys: {list(log.analysis_summary.keys())}")
    finally:
        db.close()

if __name__ == "__main__":
    verify()
