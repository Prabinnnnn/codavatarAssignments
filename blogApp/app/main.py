from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import inspect, text

from . import models  # noqa: F401
from .database import Base, engine
from .auth import router as auth_router
from .routers import blog, comments, likes


def ensure_blog_posts_owner_column() -> None:
    inspector = inspect(engine)
    if "blog_posts" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("blog_posts")}
    if "owner_id" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE blog_posts ADD COLUMN owner_id INTEGER"))


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_blog_posts_owner_column()
    yield


app = FastAPI(title="Blog CRUD API", lifespan=lifespan)

app.include_router(auth_router)
app.include_router(blog.router)
app.include_router(comments.router)
app.include_router(likes.router)


@app.get("/")
async def root():
    return {"message": "Blog API is running"}
