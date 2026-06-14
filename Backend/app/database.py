from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Get DB config from .env or use fallback
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/truthlens_db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    # Import models here so all tables are registered before create_all runs.
    from . import models  # noqa: F401

    Base.metadata.create_all(bind=engine)

    # Safely alter the table to add raw_key if it does not exist (for existing DBs)
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE api_keys ADD COLUMN raw_key VARCHAR(255) NULL;"))
            conn.commit()
    except Exception:
        pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
