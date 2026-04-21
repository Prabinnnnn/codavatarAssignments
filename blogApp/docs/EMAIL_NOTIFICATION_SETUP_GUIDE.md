# Email Notification Setup Guide (Background Tasks + FastAPI)

This guide shows how to send an email to a blog owner when someone:
- comments on their blog
- likes their blog

The implementation uses FastAPI `BackgroundTasks` so API responses stay fast while email is sent after the response is returned.

---

## Why Use Background Tasks for Email?

- **Faster API responses**: request does not wait for SMTP round-trip
- **Simple architecture**: no external queue needed for small/medium workloads
- **Clean integration**: fits naturally in route handlers after successful DB commit
- **Safe fallback**: email failures can be logged without breaking the user action

---

## Step 1: Add Environment Variables

Update your project `.env` file with SMTP settings:

```env
# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_USE_TLS=true

# Feature toggles
EMAIL_NOTIFICATIONS_ENABLED=true
NOTIFY_ON_NEW_COMMENT=true
NOTIFY_ON_BLOG_LIKE=true
```

Notes:
- Use app passwords where your provider requires them.
- Keep credentials out of source control.

---

## Step 2: Create Email Service Module

Create `app/email_service.py`:

```python
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


def notifications_enabled() -> bool:
    return os.getenv("EMAIL_NOTIFICATIONS_ENABLED", "false").lower() == "true"


def _send_email(to_email: str, subject: str, body: str) -> None:
    if not SMTP_HOST or not SMTP_FROM_EMAIL:
        return

    message = EmailMessage()
    message["From"] = SMTP_FROM_EMAIL
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as smtp:
        if SMTP_USE_TLS:
            smtp.starttls()
        if SMTP_USERNAME and SMTP_PASSWORD:
            smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
        smtp.send_message(message)


def send_comment_notification(
    owner_email: str,
    owner_username: str,
    actor_username: str,
    blog_title: str,
    blog_id: int,
    comment_excerpt: str,
) -> None:
    subject = f"New comment on your blog: {blog_title}"
    body = (
        f"Hi {owner_username},\n\n"
        f"{actor_username} commented on your blog post.\n\n"
        f"Blog: {blog_title} (ID: {blog_id})\n"
        f"Comment: {comment_excerpt}\n\n"
        "Open your app to view and reply."
    )
    _send_email(owner_email, subject, body)


def send_like_notification(
    owner_email: str,
    owner_username: str,
    actor_username: str,
    blog_title: str,
    blog_id: int,
) -> None:
    subject = f"Your blog got a new like: {blog_title}"
    body = (
        f"Hi {owner_username},\n\n"
        f"{actor_username} liked your blog post.\n\n"
        f"Blog: {blog_title} (ID: {blog_id})\n\n"
        "Open your app to see engagement details."
    )
    _send_email(owner_email, subject, body)
```

---

## Step 3: Wire Comment Notifications in Route

Update `create_comment` route in `app/routers/comments.py`:

- Add `BackgroundTasks` parameter.
- After successful commit/refresh, gather:
  - blog owner
  - blog title
  - commenter username
- Skip notification if commenter is also blog owner.
- Schedule email with `background_tasks.add_task(...)`.

Example pattern:

```python
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status

from ..email_service import notifications_enabled, send_comment_notification


@router.post("/blogs/{blog_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    blog_id: int,
    payload: CommentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    *,
    current_user: CurrentUser,
):
    blog = db.get(BlogPost, blog_id)
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog post not found")

    comment = Comment(content=payload.content, blog_id=blog_id, user_id=current_user.id)
    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Schedule notification after successful write
    if notifications_enabled() and blog.owner_id != current_user.id and blog.owner and blog.owner.email:
        background_tasks.add_task(
            send_comment_notification,
            blog.owner.email,
            blog.owner.username,
            current_user.username,
            blog.title,
            blog.id,
            payload.content[:120],
        )

    invalidate_comment_cache(comment.id)
    return _add_likes_info(comment, current_user.id, db)
```

---

## Step 4: Wire Blog Like Notifications in Route

Update `like_blog` route in `app/routers/likes.py`:

- Add `BackgroundTasks` parameter.
- After successful like commit, schedule notification.
- Skip if user likes their own blog.

Example pattern:

```python
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status

from ..email_service import notifications_enabled, send_like_notification


@router.post("/blogs/{blog_id}/likes", status_code=status.HTTP_201_CREATED)
def like_blog(
    blog_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    *,
    current_user: CurrentUser,
):
    blog = db.get(BlogPost, blog_id)
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog post not found")

    existing_like = db.query(BlogLike).filter(
        BlogLike.user_id == current_user.id,
        BlogLike.blog_id == blog_id,
    ).first()
    if existing_like:
        raise HTTPException(status_code=400, detail="You already liked this post")

    like = BlogLike(user_id=current_user.id, blog_id=blog_id)
    db.add(like)
    db.commit()

    if notifications_enabled() and blog.owner_id != current_user.id and blog.owner and blog.owner.email:
        background_tasks.add_task(
            send_like_notification,
            blog.owner.email,
            blog.owner.username,
            current_user.username,
            blog.title,
            blog.id,
        )

    invalidate_blog_cache(blog_id)
    likes_count = db.query(BlogLike).filter(BlogLike.blog_id == blog_id).count()
    return {"message": "Post liked successfully", "likes_count": likes_count}
```

---

## Step 5: Add Notification Guardrails

Recommended protections:
- **No self-notifications**: skip when actor is owner
- **Feature flags**: toggle by environment variables
- **Short timeout**: avoid hanging SMTP calls
- **Best effort only**: catch and log exceptions in email layer
- **Rate limiting/coalescing (optional)**: prevent spam for rapid likes/comments

Optional Redis key strategy for cooldown:
- `notify:blog:{blog_id}:owner:{owner_id}:actor:{actor_id}:event:{comment|like}` with TTL

---

## Step 6: Test the Flow

Manual test checklist:

1. Start app:
```bash
uvicorn app.main:app --reload
```

2. Register two users:
- User A creates a blog post
- User B comments and likes User A blog

3. Verify:
- API response is immediate
- User A receives expected email(s)
- No email if User A comments/likes own blog

---

## Step 7: Troubleshooting

If emails are not sent:

- Verify SMTP credentials and app password.
- Confirm `EMAIL_NOTIFICATIONS_ENABLED=true`.
- Check provider restrictions (TLS/port/firewall).
- Add temporary logs around `background_tasks.add_task(...)` and SMTP send.
- Test SMTP independently with a minimal script.

---

## Production Note

`BackgroundTasks` is good for simple and moderate workloads.
For high volume or guaranteed delivery, move sending to a worker queue (Celery/RQ/Arq) with retries and dead-letter handling.
