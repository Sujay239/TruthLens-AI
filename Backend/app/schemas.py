from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Literal
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserLogin(BaseModel):
    username: str  # Can be username or email
    password: str


class AdminLoginRequest(BaseModel):
    identifier: str  # Username or email
    password: str


class AdminPinVerifyRequest(BaseModel):
    admin_id: int
    pin: str


class AdminSelfPinVerify(BaseModel):
    pin: str


class AdminAuthChallengeResponse(BaseModel):
    requires_pin: bool
    admin_id: int
    message: str


class AdminAuthSuccessResponse(BaseModel):
    access_token: str
    token_type: str


class AdminData(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    avatar: Optional[str] = None

    class Config:
        from_attributes = True

class AdminCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    pin: Optional[str] = None

class AdminUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    pin: Optional[str] = None

class AdminFullResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    avatar: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AdminProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

class AdminPasswordChange(BaseModel):
    current_password: str
    new_password: str

class AdminPinChange(BaseModel):
    current_pin: str
    new_pin: str

class User(UserBase):
    id: int
    is_active: bool
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar: Optional[str] = None

    class Config:
        from_attributes = True

class AdminUserFullResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar: Optional[str] = None
    is_active: bool
    is_banned: bool
    ban_reason: Optional[str] = None
    is_2fa_enabled: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserData(BaseModel):
    username: str
    email: str
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    avatar: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# --- Common Response Models ---
class BaseAnalysisResult(BaseModel):
    label: str
    confidence_score: float
    analysis_text: str
    analysis_log_id: Optional[int] = None
    scan_id: Optional[int] = None

# --- Fake News ---
class FakeNewsRequest(BaseModel):
    text: str
    verdict: Optional[str] = None
    confidence: Optional[float] = None
    summary: Optional[str] = None
    analysis_details: Optional[dict] = None

class FakeNewsResponse(BaseAnalysisResult):
    emotional_tone: str
    source_credibility: str
    semantic_consistency: str

# --- Deepfake Image ---
# Image upload is handled via Form data / UploadFile, so we might not need a specialized Request Schema for the body itself if using fastapi.UploadFile
class ImageScanResponse(BaseAnalysisResult):
    visual_artifacts: str
    pixel_consistency: str
    metadata_analysis: str

# --- Deepfake Video ---
class VideoScanResponse(BaseAnalysisResult):
    frame_consistency: str
    audio_visual_sync: str
    blinking_patterns: str

# --- Deepfake Voice ---
class AudioScanResponse(BaseAnalysisResult):
    spectral_analysis: str
    voice_cloning_signature: str
    background_noise: str

# --- AI Text ---
class AiTextRequest(BaseModel):
    text: str

class AiTextResponse(BaseAnalysisResult):
    perplexity: str
    burstiness: str
    repetitive_patterns: str

# --- Malware ---
class MalwareUrlRequest(BaseModel):
    url: str

class MalwareResponse(BaseModel):
    label: str
    threat_score: int
    threat_level: str
    signature_match: str
    heuristic_score: str
    analysis_text: str
    analysis_log_id: Optional[int] = None
    scan_id: Optional[int] = None

# --- History Log ---
class AnalysisLogResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    result_label: str
    confidence_score: float
    date_created: datetime
    file_size: Optional[str] = None
    media_url: Optional[str] = None
    scan_type: Optional[str] = None
    scan_id: Optional[int] = None
    analysis_summary: Optional[dict] = None

    class Config:
        from_attributes = True


class AdminAnalysisLogResponse(AnalysisLogResponse):
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None

    class Config:
        from_attributes = True

# --- Feedback ---
class FeedbackCreate(BaseModel):
    analysis_log_id: int
    rating: Literal["like", "dislike"]
    message: Optional[str] = None
    corrected_label: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    analysis_log_id: int
    scan_type: str
    scan_id: int
    rating: str
    message: Optional[str] = None
    corrected_label: Optional[str] = None
    model_processed: bool
    created_at: datetime

    class Config:
        from_attributes = True

class FeedbackLearningStatResponse(BaseModel):
    scan_type: str
    predicted_label: str
    likes: int
    dislikes: int
    correction_label: Optional[str] = None
    correction_count: int
    confidence_adjustment: float
    updated_at: datetime

    class Config:
        from_attributes = True

class AdminFeedbackResponse(FeedbackResponse):
    user_name: str
    user_email: str
    filename: str
    predicted_label: str
    confidence_score: float

    class Config:
        from_attributes = True

class FeedbackManagementOverview(BaseModel):
    total_feedbacks: int
    processed_feedbacks: int
    pending_feedbacks: int
    likes_total: int
    dislikes_total: int
    learning_stats: List[FeedbackLearningStatResponse]

# --- Dashboard Schemas ---
class DashboardStats(BaseModel):
    title: str
    value: str
    change: str
    icon_type: str

class ChartData(BaseModel):
    name: str
    scans: int

class PieData(BaseModel):
    name: str
    value: int

class RecentActivityItem(BaseModel):
    id: int
    type: str
    name: str
    status: str
    date: str
    confidence: str

class DashboardOverview(BaseModel):
    stats: List[DashboardStats]
    chart_data: List[ChartData]
    pie_data: List[PieData]
    recent_activity: List[RecentActivityItem]


class AdminScanTypeData(BaseModel):
    name: str
    scans: int


class AdminRecentActivityItem(BaseModel):
    id: int
    user_name: str
    file_type: str
    result_label: str
    date: datetime
    confidence: float


class AdminDashboardOverview(BaseModel):
    total_scans: int
    total_users: int
    total_real_detected: int
    total_fake_detected: int
    happy_feedback: int
    unhappy_feedback: int
    happy_feedback_rate: float
    scan_type_breakdown: List[AdminScanTypeData]
    real_vs_fake: List[AdminScanTypeData]
    recent_activity: List[AdminRecentActivityItem]

class AdminStatusChangeRequest(BaseModel):
    admin_password: str
    ban_reason: Optional[str] = None

class SupportTicketCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    reason: str
    message: str

class SupportTicketResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone_number: Optional[str] = None
    reason: str
    message: str
    status: str
    rejection_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SupportTicketStatusUpdate(BaseModel):
    status: Literal["Pending", "Processing", "Solved", "Rejected"]
    rejection_reason: Optional[str] = None

# --- Audit Log Schemas ---
class AuditLogBase(BaseModel):
    action: str
    actor_id: Optional[int] = None
    actor_type: str # "user" or "admin"
    actor_username: str
    target_id: Optional[int] = None
    target_type: Optional[str] = None
    description: str
    status: str = "success"
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLogResponse(AuditLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class BlogBase(BaseModel):
    title: str
    excerpt: str
    content: str
    category: str
    author: str
    read_time: str
    image_url: str

class BlogCreate(BlogBase):
    pass

class BlogResponse(BlogBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ResearchPaperBase(BaseModel):
    title: str
    authors: str
    conference: str
    date: str
    abstract: str
    keywords: str
    file_url: str

class ResearchPaperCreate(ResearchPaperBase):
    pass

class ResearchPaperResponse(ResearchPaperBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
