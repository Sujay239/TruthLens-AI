from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    full_name = Column(String(255), nullable=True) # Keeping for backward compatibility or display
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    phone_number = Column(String(50), nullable=True)
    avatar = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    is_banned = Column(Boolean, default=False)
    ban_reason = Column(Text, nullable=True)
    is_2fa_enabled = Column(Boolean, default=False)
    reset_token = Column(String(500), nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)

    analyses = relationship("AnalysisLog", back_populates="user")
    
    # Relationships to specific scans
    fake_news_scans = relationship("FakeNewsScan", back_populates="user")
    image_scans = relationship("ImageScan", back_populates="user")
    video_scans = relationship("VideoScan", back_populates="user")
    audio_scans = relationship("AudioScan", back_populates="user")
    ai_text_scans = relationship("AiTextScan", back_populates="user")
    malware_scans = relationship("MalwareScan", back_populates="user")
    feedback = relationship("ScanFeedback", back_populates="user")

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    avatar = Column(String(500), nullable=True)
    pin = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AnalysisLog(Base):
    __tablename__ = "analysis_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    filename = Column(String(255)) # Or Content Snippet
    file_type = Column(String(50)) # Image, Video, Audio, Text, URL
    date_created = Column(DateTime, default=datetime.utcnow)
    
    result_label = Column(String(50)) # Real, Fake, Suspicious, AI Generated...
    confidence_score = Column(Float)
    file_size = Column(String(50), nullable=True)
    
    media_url = Column(String(500), nullable=True) 
    
    # Pointer back to the concrete scan row that produced this history item.
    scan_type = Column(String(50), nullable=True, index=True)
    scan_id = Column(Integer, nullable=True, index=True)
    
    # Generic JSON for quick retrieval in history list if needed
    analysis_summary = Column(JSON, nullable=True) 

    user = relationship("User", back_populates="analyses")
    feedback = relationship("ScanFeedback", back_populates="analysis_log", cascade="all, delete-orphan")

class ScanFeedback(Base):
    __tablename__ = "scan_feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    analysis_log_id = Column(Integer, ForeignKey("analysis_logs.id"), nullable=False, index=True)
    scan_type = Column(String(50), nullable=False, index=True)
    scan_id = Column(Integer, nullable=False, index=True)
    rating = Column(String(20), nullable=False)  # like or dislike
    message = Column(Text, nullable=True)
    corrected_label = Column(String(50), nullable=True)
    model_processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="feedback")
    analysis_log = relationship("AnalysisLog", back_populates="feedback")

class FeedbackLearningStat(Base):
    __tablename__ = "feedback_learning_stats"

    id = Column(Integer, primary_key=True, index=True)
    scan_type = Column(String(50), nullable=False, index=True)
    predicted_label = Column(String(50), nullable=False, index=True)
    likes = Column(Integer, default=0)
    dislikes = Column(Integer, default=0)
    correction_label = Column(String(50), nullable=True)
    correction_count = Column(Integer, default=0)
    confidence_adjustment = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone_number = Column(String(50), nullable=True)
    reason = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="Pending") # Pending, Processing, Solved, Rejected
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# --- Specific Scan Tables ---

class FakeNewsScan(Base):
    __tablename__ = "fake_news_scans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content_text = Column(Text) # Store the text analyzed
    label = Column(String(50)) # Real, Fake, Leaning Fake...
    confidence_score = Column(Float)
    emotional_tone = Column(String(255))
    source_credibility = Column(String(255))
    semantic_consistency = Column(String(255))
    analysis_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="fake_news_scans")

class ImageScan(Base):
    __tablename__ = "image_scans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    image_url = Column(String(500))
    label = Column(String(50)) # Real, Fake
    confidence_score = Column(Float)
    visual_artifacts = Column(String(255))
    pixel_consistency = Column(String(255))
    metadata_analysis = Column(String(255))
    analysis_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="image_scans")

class VideoScan(Base):
    __tablename__ = "video_scans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    video_url = Column(String(500))
    label = Column(String(50))
    confidence_score = Column(Float)
    frame_consistency = Column(String(255))
    audio_visual_sync = Column(String(255))
    blinking_patterns = Column(String(255))
    analysis_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    video_hash = Column(String(64), index=True, nullable=True) # SHA256 Hash
    user = relationship("User", back_populates="video_scans")

class AudioScan(Base):
    __tablename__ = "audio_scans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    audio_url = Column(String(500))
    label = Column(String(50))
    confidence_score = Column(Float)
    spectral_analysis = Column(String(255))
    voice_cloning_signature = Column(String(255))
    background_noise = Column(String(255))
    analysis_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="audio_scans")

class AiTextScan(Base):
    __tablename__ = "ai_text_scans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content_text = Column(Text)
    label = Column(String(50)) # Human Written, AI Generated
    confidence_score = Column(Float)
    perplexity = Column(String(255))
    burstiness = Column(String(255))
    repetitive_patterns = Column(String(255))
    analysis_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="ai_text_scans")

class MalwareScan(Base):
    __tablename__ = "malware_scans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    target = Column(String(500)) # File name or URL
    scan_type = Column(String(50)) # "Files" or "URL"
    label = Column(String(50)) # Clean, Suspicious, Malicious
    threat_score = Column(Integer)
    threat_level = Column(String(50)) # Low, Medium, High
    signature_match = Column(String(255))
    heuristic_score = Column(String(50))
    analysis_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="malware_scans")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, nullable=True) # ID of the user/admin who performed the action
    actor_type = Column(String(50)) # "user" or "admin"
    actor_username = Column(String(255))
    action = Column(String(255)) # "login", "logout", "password_change", etc.
    target_id = Column(Integer, nullable=True) # ID of the object being acted upon (if any)
    target_type = Column(String(50), nullable=True) # "user", "admin", "ticket", etc.
    description = Column(Text) # Human-readable description
    status = Column(String(50), default="success") # "success", "failure", "pending"
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
