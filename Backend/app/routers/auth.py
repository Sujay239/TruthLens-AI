from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from .. import models, schemas, utils, database, dependencies
from app.email_utils import send_email
from app.email_templates import get_password_reset_template
import uuid
from datetime import datetime
from fastapi import BackgroundTasks, UploadFile, File
import shutil
import os

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.get("/myData", response_model=schemas.UserData)
def get_my_data(current_user: models.User = Depends(dependencies.get_current_user)):
    return {
        "email": current_user.email,
        "username": current_user.username,
        "first_name": current_user.first_name if current_user.first_name else "",
        "last_name": current_user.last_name if current_user.last_name else "",
        "phone_number": current_user.phone_number,
        "avatar": current_user.avatar
    }

@router.put("/me", response_model=schemas.User)
def update_user_profile(
    user_update: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name
        
    # Maintain full_name for backward compatibility
    # Ensure none values are empty strings when constructing full name
    fn = current_user.first_name if current_user.first_name else ""
    ln = current_user.last_name if current_user.last_name else ""
    current_user.full_name = f"{fn} {ln}".strip()
    
    if user_update.phone_number is not None:
        current_user.phone_number = user_update.phone_number
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    # Ensure directory exists
    UPLOAD_DIR = "uploads/avatars"
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        
    # Create valid filename
    file_ext = file.filename.split(".")[-1]
    filename = f"{current_user.id}_{int(datetime.utcnow().timestamp())}.{file_ext}"
    file_path = f"{UPLOAD_DIR}/{filename}"
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Update User DB
    # The URL will be /static/avatars/filename
    avatar_url = f"http://localhost:8000/uploads/avatars/{filename}"
    current_user.avatar = avatar_url
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Avatar uploaded successfully", "avatar_url": avatar_url}

@router.put("/change-password")
def change_password(
    password_update: schemas.UserPasswordUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if not utils.verify_password(password_update.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
        
    current_user.hashed_password = utils.get_password_hash(password_update.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}

@router.post("/register", response_model=schemas.User)
def register(
    user: schemas.UserCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db)
):
    # Normalize email to lowercase
    user.email = user.email.lower()
    
    # DEBUG LOGGING
    print(f"DEBUG: Registering user: {user.username}")
    print(f"DEBUG: Received Data: {user.dict()}")
    print(f"DEBUG: first_name={user.first_name}, last_name={user.last_name}")

    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_email = db.query(models.User).filter(models.User.email == user.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = utils.get_password_hash(user.password)
    
    # Create full name for fallback
    full_name = f"{user.first_name} {user.last_name}".strip() if user.first_name or user.last_name else None
    
    db_user = models.User(
        email=user.email, 
        username=user.username, 
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        full_name=full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Send Welcome Email
    from app.email_templates import get_welcome_email_template
    subject = "Welcome to TruthLens AI! 🛡️"
    body = get_welcome_email_template(user.username)
    
    try:
        background_tasks.add_task(send_email, subject, [user.email], body)
    except Exception as e:
        print(f"Failed to send welcome email: {e}")

    return db_user

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    # Simple JSON login
    user = db.query(models.User).filter(models.User.username == user_credentials.username).first()
    if not user:
        # Check if they used email instead (normalize to lowercase)
        user = db.query(models.User).filter(models.User.email == user_credentials.username.lower()).first()
    
    if not user or not utils.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = utils.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(
    request: schemas.ForgotPasswordRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.email == request.email.lower()).first()
    if not user:
        # Don't reveal if email exists, just return success
        return {"message": "If the email exists, a reset link has been sent."}

    # Generate Token
    token = str(uuid.uuid4())
    user.reset_token = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=15)
    db.commit()

    # Send Email
    reset_link = f"http://localhost:5173/auth/forgot-password?token={token}"
    subject = "Reset Your Password - TruthLens AI"
    body = get_password_reset_template(reset_link)
    
    background_tasks.add_task(send_email, subject, [user.email], body)
    
    return {"message": "If the email exists, a reset link has been sent."}

@router.post("/reset-password")
def reset_password(
    request: schemas.ResetPasswordRequest, 
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.reset_token == request.token).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")
    
    if user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token has expired")
    
    # Update Password
    user.hashed_password = utils.get_password_hash(request.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()
    
    return {"message": "Password updated successfully"}
