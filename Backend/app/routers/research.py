from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import uuid
import os
import shutil
from datetime import datetime

from .. import models, schemas, database, dependencies

router = APIRouter(
    prefix="/research",
    tags=["Research Papers"]
)

@router.post("/upload-file")
async def upload_research_file(
    file: UploadFile = File(...),
    current_admin: models.Admin = Depends(dependencies.get_current_admin)
):
    """
    Upload a PDF or DOCX file for a research paper. Returns the file URL.
    """
    UPLOAD_DIR = "uploads/research"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    file_ext = (file.filename or "pdf").rsplit(".", 1)[-1].lower()
    if file_ext not in {"pdf", "docx"}:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed")
        
    filename = f"paper_{int(datetime.utcnow().timestamp())}_{uuid.uuid4().hex[:6]}.{file_ext}"
    file_path = f"{UPLOAD_DIR}/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"http://localhost:8000/uploads/research/{filename}"}

@router.post("/", response_model=schemas.ResearchPaperResponse)
def create_research_paper(
    paper: schemas.ResearchPaperCreate, 
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin)
):
    """
    Create a new research paper entry. Only accessible by admins.
    """
    new_paper = models.ResearchPaper(
        id=str(uuid.uuid4()),
        title=paper.title,
        authors=paper.authors,
        conference=paper.conference,
        date=paper.date,
        abstract=paper.abstract,
        keywords=paper.keywords,
        file_url=paper.file_url
    )
    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)
    return new_paper

@router.get("/", response_model=List[schemas.ResearchPaperResponse])
def get_research_papers(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(database.get_db)
):
    """
    Get a paginated list of research papers. Publicly accessible.
    """
    papers = db.query(models.ResearchPaper).order_by(models.ResearchPaper.created_at.desc()).offset(offset).limit(limit).all()
    return papers

@router.get("/{paper_id}", response_model=schemas.ResearchPaperResponse)
def get_research_paper(paper_id: str, db: Session = Depends(database.get_db)):
    """
    Get a specific research paper by its ID. Publicly accessible.
    """
    paper = db.query(models.ResearchPaper).filter(models.ResearchPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Research paper not found")
    return paper

@router.put("/{paper_id}", response_model=schemas.ResearchPaperResponse)
def update_research_paper(
    paper_id: str,
    paper_in: schemas.ResearchPaperCreate,
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin)
):
    """
    Update an existing research paper. Only accessible by admins.
    """
    paper = db.query(models.ResearchPaper).filter(models.ResearchPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Research paper not found")
        
    paper.title = paper_in.title
    paper.authors = paper_in.authors
    paper.conference = paper_in.conference
    paper.date = paper_in.date
    paper.abstract = paper_in.abstract
    paper.keywords = paper_in.keywords
    paper.file_url = paper_in.file_url
    
    db.commit()
    db.refresh(paper)
    return paper

@router.delete("/{paper_id}")
def delete_research_paper(
    paper_id: str,
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(dependencies.get_current_admin)
):
    """
    Delete a research paper. Only accessible by admins.
    """
    paper = db.query(models.ResearchPaper).filter(models.ResearchPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Research paper not found")
        
    db.delete(paper)
    db.commit()
    return {"message": "Research paper deleted successfully"}
