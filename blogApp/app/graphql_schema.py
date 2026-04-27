from typing import Any

from fastapi import Depends
import strawberry
from graphql import GraphQLError
from sqlalchemy.orm import Session, joinedload
from strawberry.fastapi import GraphQLRouter
from strawberry.types import Info

from .database import get_db
from .models.blog import BlogPost
from .models.comment import Comment
from .models.likes import BlogLike


@strawberry.type
class UserSummary:
    id: int
    username: str


@strawberry.type
class BlogSummary:
    id: int
    title: str
    author: str
    word_count: int
    total_likes: int
    liked_by_users: list[UserSummary]
    total_comments: int
    commented_by_users: list[UserSummary]


def _count_words(content: str) -> int:
    return len(content.split()) if content else 0


def _to_blog_summary(blog: BlogPost) -> BlogSummary:
    liked_users_map: dict[int, UserSummary] = {}
    commented_users_map: dict[int, UserSummary] = {}

    for like in blog.likes:
        if like.user is not None and like.user.id not in liked_users_map:
            liked_users_map[like.user.id] = UserSummary(id=like.user.id, username=like.user.username)

    for comment in blog.comments:
        if comment.user is not None and comment.user.id not in commented_users_map:
            commented_users_map[comment.user.id] = UserSummary(id=comment.user.id, username=comment.user.username)

    return BlogSummary(
        id=blog.id,
        title=blog.title,
        author=blog.author,
        word_count=_count_words(blog.content),
        total_likes=len(blog.likes),
        liked_by_users=sorted(liked_users_map.values(), key=lambda user: user.username.lower()),
        total_comments=len(blog.comments),
        commented_by_users=sorted(commented_users_map.values(), key=lambda user: user.username.lower()),
    )


@strawberry.type
class Query:
    @strawberry.field
    def blog_summary(self, info: Info[dict[str, Any], None], blog_id: int) -> BlogSummary:
        db: Session = info.context["db"]
        blog = (
            db.query(BlogPost)
            .options(
                joinedload(BlogPost.likes).joinedload(BlogLike.user),
                joinedload(BlogPost.comments).joinedload(Comment.user),
            )
            .filter(BlogPost.id == blog_id)
            .first()
        )

        if blog is None:
            raise GraphQLError("Blog post not found")

        return _to_blog_summary(blog)

    @strawberry.field
    def blog_summaries(
        self,
        info: Info[dict[str, Any], None],
        skip: int = 0,
        limit: int = 10,
    ) -> list[BlogSummary]:
        db: Session = info.context["db"]
        blogs = (
            db.query(BlogPost)
            .options(
                joinedload(BlogPost.likes).joinedload(BlogLike.user),
                joinedload(BlogPost.comments).joinedload(Comment.user),
            )
            .offset(skip)
            .limit(limit)
            .all()
        )
        return [_to_blog_summary(blog) for blog in blogs]


def get_graphql_context(db: Session = Depends(get_db)) -> dict[str, Session]:
    return {"db": db}


schema = strawberry.Schema(query=Query)
graphql_router = GraphQLRouter(schema, context_getter=get_graphql_context)