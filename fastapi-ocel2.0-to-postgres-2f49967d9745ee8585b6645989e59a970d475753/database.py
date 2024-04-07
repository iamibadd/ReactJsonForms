from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import dotenv_values, load_dotenv
import os

config = dotenv_values(".env")
connect = load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv('POSTGRES_URL')

engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# getting database

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()