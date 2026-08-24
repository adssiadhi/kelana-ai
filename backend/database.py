from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# load .env so os.getenv() can read it
load_dotenv()
# connection string from .env — never hardcode secrets
DATABASE_URL = os.getenv("DATABASE_URL")

# engine = the connection pool
engine = create_engine(DATABASE_URL)
# SessionLocal = a factory for DB sessions
SessionLocal = sessionmaker(bind=engine, autoflush=False)

# Base = all ORM models inherit from this
Base = declarative_base()

# create all tables
def init_db() -> None:
    """Create all SQLAlchemy tables for the configured
database."""
    Base.metadata.create_all(bind=engine)
    ensure_trip_schema()


def ensure_trip_schema() -> None:
    """Apply lightweight schema fixes for older local databases."""
    inspector = inspect(engine)

    if "trips" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("trips")}

    with engine.begin() as connection:
        if "travel_style" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE trips "
                    "ADD COLUMN travel_style VARCHAR DEFAULT 'General' NOT NULL"
                )
            )

        if "ai_recommendation" not in columns:
            if "get_ai_recommendation" in columns:
                connection.execute(
                    text(
                        "ALTER TABLE trips "
                        "RENAME COLUMN get_ai_recommendation TO ai_recommendation"
                    )
                )
            else:
                connection.execute(
                    text("ALTER TABLE trips ADD COLUMN ai_recommendation TEXT")
                )
