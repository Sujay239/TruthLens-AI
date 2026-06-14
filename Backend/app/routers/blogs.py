from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import uuid
import os
import shutil
from datetime import datetime

from .. import models, schemas, database, dependencies

router = APIRouter(
    prefix="/blogs",
    tags=["Blogs"]
)

@router.post("/upload-image")
async def upload_blog_image(
    file: UploadFile = File(...),
    current_admin: models.Admin = Depends(dependencies.get_current_admin)
):
    """
    Upload an image for a blog post. Returns the image URL.
    """
    UPLOAD_DIR = "uploads/blogs"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    file_ext = (file.filename or "jpg").rsplit(".", 1)[-1].lower()
    if file_ext not in {"jpg", "jpeg", "png", "webp", "gif"}:
        raise HTTPException(status_code=400, detail="Only image files are allowed")
        
    filename = f"blog_{int(datetime.utcnow().timestamp())}_{uuid.uuid4().hex[:6]}.{file_ext}"
    file_path = f"{UPLOAD_DIR}/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Standard URL construction using local server path
    return {"url": f"http://localhost:8000/uploads/blogs/{filename}"}

@router.post("/", response_model=schemas.BlogResponse)
def create_blog(
    blog: schemas.BlogCreate, 
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin)
):
    """
    Create a new blog post. Only accessible by admins.
    """
    new_blog = models.Blog(
        id=str(uuid.uuid4()),
        title=blog.title,
        excerpt=blog.excerpt,
        content=blog.content,
        category=blog.category,
        author=blog.author,
        read_time=blog.read_time,
        image_url=blog.image_url
    )
    db.add(new_blog)
    db.commit()
    db.refresh(new_blog)
    return new_blog

@router.get("/", response_model=List[schemas.BlogResponse])
def get_blogs(
    limit: int = Query(6, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(database.get_db)
):
    """
    Get a paginated list of blogs. Publicly accessible.
    """
    blogs = db.query(models.Blog).order_by(models.Blog.created_at.desc()).offset(offset).limit(limit).all()
    return blogs

@router.get("/{blog_id}", response_model=schemas.BlogResponse)
def get_blog(blog_id: str, db: Session = Depends(database.get_db)):
    """
    Get a specific blog by its ID. Publicly accessible.
    """
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog

@router.put("/{blog_id}", response_model=schemas.BlogResponse)
def update_blog(
    blog_id: str,
    blog_in: schemas.BlogCreate,
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin)
):
    """
    Update an existing blog post. Only accessible by admins.
    """
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
        
    blog.title = blog_in.title
    blog.excerpt = blog_in.excerpt
    blog.content = blog_in.content
    blog.category = blog_in.category
    blog.author = blog_in.author
    blog.read_time = blog_in.read_time
    blog.image_url = blog_in.image_url
    
    db.commit()
    db.refresh(blog)
    return blog
