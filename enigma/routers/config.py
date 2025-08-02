from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from enigma.db import DBEnigmaConfig, get_db
from enigma.ciphers.enigma.configs import EnigmaConfig


router = APIRouter(prefix="/configs")


class EnigmaConfigCreate(EnigmaConfig):
    name: str


@router.post("")
def create_config(
    config: EnigmaConfigCreate,
    db: Session = Depends(get_db),
):
    # Проверяем уникальность имени
    existing = db.query(DBEnigmaConfig).filter(
        DBEnigmaConfig.name == config.name
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Config with this name already exists"
        )
    
    # Создаем новую конфигурацию
    db_config = DBEnigmaConfig(**config.dict())
    db.add(db_config)
    db.commit()
    db.refresh(db_config)


@router.get("/{config_name}")
def get_config(config_name: str, db: Session = Depends(get_db)):
    config = db.query(DBEnigmaConfig).filter(
        DBEnigmaConfig.name == config_name
    ).first()
    
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    
    return {
        "name": config.name,
        "rotors": config.rotors,
        "reflector": config.reflector,
        "ring_settings": config.ring_settings,
        "initial_positions": config.initial_positions,
        "plugboard_pairs": config.plugboard_pairs
    }
