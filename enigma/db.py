from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./ciphers.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class DBEnigmaConfig(Base):
    __tablename__ = "enigma_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    rotors = Column(JSON)
    reflector = Column(String)
    ring_settings = Column(JSON)
    initial_positions = Column(String)
    plugboard_pairs = Column(JSON)


class DBJeffersonConfig(Base):
    __tablename__ = "jefferson_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    disks = Column(JSON)
    secret_key = Column(JSON)
    num_disks = Column(Integer)
    key_row = Column(Integer)


Base.metadata.create_all(bind=engine)

# Dependency для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
