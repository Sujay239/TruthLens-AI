import os
import smtplib
from email.message import EmailMessage
from typing import List
from dotenv import load_dotenv

load_dotenv()

# SMTP Configuration from .env
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "").strip()
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "").strip()
MAIL_FROM = os.getenv("MAIL_FROM", "").strip()
MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
MAIL_SERVER = os.getenv("MAIL_SERVER", "").strip()
MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "TruthLens AI").strip().strip('"').strip("'")
MAIL_STARTTLS = str(os.getenv("MAIL_STARTTLS", "True")).lower() == "true"
MAIL_SSL_TLS = str(os.getenv("MAIL_SSL_TLS", "False")).lower() == "true"

print(f"SMTP Config: Server={MAIL_SERVER}, Port={MAIL_PORT}, User={MAIL_USERNAME}, StartTLS={MAIL_STARTTLS}")

def send_email(subject: str, recipients: List[str], body: str):
    """
    Sends an email using the built-in smtplib.
    This is synchronous but safe to use within FastAPI BackgroundTasks.
    """
    message = EmailMessage()
    message["From"] = f"{MAIL_FROM_NAME} <{MAIL_FROM}>"
    message["To"] = ", ".join(recipients)
    message["Subject"] = subject
    message.set_content(body, subtype="html")

    try:
        # Determine connection type
        if MAIL_SSL_TLS:
            server = smtplib.SMTP_SSL(MAIL_SERVER, MAIL_PORT)
        else:
            server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT)
            if MAIL_STARTTLS:
                server.starttls()
        
        # Login if credentials provided
        if MAIL_USERNAME and MAIL_PASSWORD:
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            
        server.send_message(message)
        server.quit()
        print(f"Email sent successfully to {recipients}")
            
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise e
