from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
import requests
import xml.etree.ElementTree as ET
import urllib.parse

# Secret key for JWT (in production, use environment variable)
SECRET_KEY = "your-secret-key-keep-it-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def search_google_news(query: str):
    """
    Search Google News RSS for a query and return top results.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        # Strategy 1: Cleaned First Sentence
        clean_query = query.split('\n')[0]
        if ':' in clean_query[:30]:
            clean_query = clean_query.split(':', 1)[1].strip()
        clean_query = clean_query[:120]
        
        print(f"Primary Search: {clean_query}")
        encoded_query = urllib.parse.quote(clean_query)
        url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en"
        
        response = requests.get(url, headers=headers, timeout=5)
        root = ET.fromstring(response.text)
        items = []
        
        for item in root.findall('.//item')[:5]:
            items.append({
                "title": item.find('title').text or "",
                "link": item.find('link').text or "",
                "publisher": item.find('source').text if item.find('source') is not None else "Unknown",
                "date": item.find('pubDate').text or ""
            })
            
        # Strategy 2: Fallback to Keywords if primary failed
        if not items:
            keywords = " ".join(clean_query.split()[:5]) # Take first 5 words
            print(f"Fallback Search (Keywords): {keywords}")
            encoded_keywords = urllib.parse.quote(keywords)
            url = f"https://news.google.com/rss/search?q={encoded_keywords}&hl=en-IN&gl=IN&ceid=IN:en"
            response = requests.get(url, headers=headers, timeout=5)
            root = ET.fromstring(response.text)
            for item in root.findall('.//item')[:5]:
                items.append({
                    "title": item.find('title').text or "",
                    "link": item.find('link').text or "",
                    "publisher": item.find('source').text if item.find('source') is not None else "Unknown",
                    "date": item.find('pubDate').text or ""
                })
            
        return items
    except Exception as e:
        print(f"News Search Error: {e}")
        return []
