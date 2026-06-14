
from app.database import SessionLocal
from app import models

db = SessionLocal()

print("Counts:")
print(f"Total AnalysisLog: {db.query(models.AnalysisLog).count()}")
print(f"FakeNewsScan: {db.query(models.FakeNewsScan).count()}")
print(f"AnalysisLog (fake_news): {db.query(models.AnalysisLog).filter(models.AnalysisLog.scan_type == 'fake_news').count()}")
print(f"ImageScan: {db.query(models.ImageScan).count()}")
print(f"AnalysisLog (image): {db.query(models.AnalysisLog).filter(models.AnalysisLog.scan_type == 'image').count()}")
print(f"VideoScan: {db.query(models.VideoScan).count()}")
print(f"AnalysisLog (video): {db.query(models.AnalysisLog).filter(models.AnalysisLog.scan_type == 'video').count()}")
print(f"AudioScan: {db.query(models.AudioScan).count()}")
print(f"AnalysisLog (audio): {db.query(models.AnalysisLog).filter(models.AnalysisLog.scan_type == 'audio').count()}")
print(f"AiTextScan: {db.query(models.AiTextScan).count()}")
print(f"AnalysisLog (ai_text): {db.query(models.AnalysisLog).filter(models.AnalysisLog.scan_type == 'ai_text').count()}")
print(f"MalwareScan: {db.query(models.MalwareScan).count()}")
print(f"AnalysisLog (malware): {db.query(models.AnalysisLog).filter(models.AnalysisLog.scan_type == 'malware').count()}")

db.close()
