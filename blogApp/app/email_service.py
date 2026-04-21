import os
import smtplib
from email.message import EmailMessage
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USERNAME)
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"


def notification_enabled() -> bool:
    return os.getenv("EMAIL_NOTIFICATIONS_ENABLED", "false").lower() == "true"


def _send_email(to_email: str, subject: str, body: str) -> None:
    if not SMTP_HOST or not SMTP_FROM_EMAIL:
        return

    message = EmailMessage()
    message["From"] = SMTP_FROM_EMAIL
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as smtp:
            if SMTP_USE_TLS:
                smtp.starttls()
            if SMTP_USERNAME and SMTP_PASSWORD:
                smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
            smtp.send_message(message)
    except OSError:
        return


def send_comment_notification(
    owner_email: str,
    owner_username: str,
    actor_username: str,
    blog_title: str,
    blog_id: int,
    comment_excerpt: str,
) -> None:
    subject = f"New comment on your blog post '{blog_title}'"
    body = (
        f"Hi {owner_username},\n\n"
        f"{actor_username} commented on your blog post '{blog_title}':\n\n"
        f"Blog: {blog_title} (ID: {blog_id})\n"
        f"\"{comment_excerpt}\"\n\n"
        "Best,\nYour Blog Team"
    )
    _send_email(owner_email, subject, body)


def send_like_notification(
    owner_email: str,
    owner_username: str,
    actor_username: str,
    blog_title: str,
    blog_id: int,
) -> None:
    subject = f"Your blog post '{blog_title}' got a new like!"
    body = (
        f"Hi {owner_username},\n\n"
        f"{actor_username} liked your blog post '{blog_title}'.\n\n"
        f"Blog: {blog_title} (ID: {blog_id})\n\n"
        "Best,\nYour Blog Team"
    )
    _send_email(owner_email, subject, body)