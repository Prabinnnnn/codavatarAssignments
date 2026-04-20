from pathlib import Path
import os

from dotenv import load_dotenv
from redis import Redis


load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

redis_client = Redis.from_url(REDIS_URL, decode_responses=True)