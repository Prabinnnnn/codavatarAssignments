# Blog API

A FastAPI-based blog application with user authentication, blog posts, comments, and likes functionality.

## Features

- 🔐 **User Authentication**: JWT-based authentication with secure password hashing
- 📝 **Blog Management**: Create, read, update, and delete blog posts
- 💬 **Comments**: Add, update, and delete comments on blog posts
- 👍 **Likes System**: Like/unlike blog posts and comments
- 🗄️ **PostgreSQL Database**: Persistent data storage with SQLAlchemy ORM
- 🔄 **Alembic Migrations**: Database version control and migrations

## Tech Stack

- **FastAPI**: Modern web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **PostgreSQL**: Relational database
- **Alembic**: Database migration tool
- **PyJWT**: JWT token generation and validation
- **pwdlib**: Password hashing library

## Project Structure

```
learnfastapi/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── auth.py                 # Authentication logic and routes
│   ├── database.py             # Database configuration
│   ├── utils.py                # Utility functions
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── blog.py
│   │   ├── comment.py
│   │   └── likes.py
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── blog.py
│   │   └── comment.py
│   └── routers/                # API route handlers
│       ├── __init__.py
│       ├── blog.py
│       ├── comments.py
│       └── likes.py
├── alembic/                    # Database migrations
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── docs/                       # Documentation
├── .env                        # Environment variables (not committed)
├── .gitignore
├── alembic.ini
├── docker-compose.yml          # PostgreSQL container setup
├── pyproject.toml
└── README.md
```

## Installation

### Prerequisites

- Python 3.10+
- PostgreSQL 16+ (or Docker)
- Poetry (optional, but recommended)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd learnfastapi
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   # or with Poetry:
   poetry install
   ```

4. **Set up the database**
   
   Using Docker Compose:
   ```bash
   docker-compose up -d
   ```
   
   Or configure PostgreSQL connection in `.env`:
   ```env
   DATABASE_URL=postgresql+psycopg2://fastapi_user:fastapi_password@localhost:5432/blog_db
   SECRET_KEY=your_secret_key_here
   ```

5. **Run database migrations**
   ```bash
   python -m alembic upgrade head
   ```

6. **Start the development server**
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`

Interactive documentation: `http://localhost:8000/docs`

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get access token

### Blog Posts
- `GET /blogs` - List all blog posts
- `GET /blogs/{blog_id}` - Get a specific blog post
- `POST /blogs` - Create a new blog post (requires auth)
- `PUT /blogs/{blog_id}` - Update a blog post (requires auth, owner only)
- `DELETE /blogs/{blog_id}` - Delete a blog post (requires auth, owner only)

### Comments
- `GET /blogs/{blog_id}/comments` - List comments for a blog post
- `GET /comments/{comment_id}` - Get a specific comment
- `POST /blogs/{blog_id}/comments` - Create a comment (requires auth)
- `PUT /comments/{comment_id}` - Update a comment (requires auth, author only)
- `DELETE /comments/{comment_id}` - Delete a comment (requires auth, author only)

### Likes
- `POST /blogs/{blog_id}/likes` - Like a blog post (requires auth)
- `DELETE /blogs/{blog_id}/likes` - Unlike a blog post (requires auth)
- `POST /comments/{comment_id}/likes` - Like a comment (requires auth)
- `DELETE /comments/{comment_id}/likes` - Unlike a comment (requires auth)

## Database Migrations

### Create a new migration
```bash
python -m alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations
```bash
python -m alembic upgrade head
```

### Rollback migrations
```bash
python -m alembic downgrade -1
```

### View migration history
```bash
python -m alembic history
```

## Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql+psycopg2://fastapi_user:fastapi_password@localhost:5432/blog_db

# Security
SECRET_KEY=your_super_secret_key_here_change_in_production
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black app/
```

### Linting
```bash
flake8 app/
```

## Docker

Start PostgreSQL with Docker Compose:

```bash
docker-compose up -d
```

Stop the services:

```bash
docker-compose down
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an Issue on GitHub.
