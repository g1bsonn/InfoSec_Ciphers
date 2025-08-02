from fastapi import Depends, APIRouter
from pydantic import BaseModel
from enigma.ciphers.enigma import EnigmaInput, setup_enigma
from sqlalchemy.orm import Session

from enigma.db import DBEnigmaConfig, get_db

router = APIRouter(prefix="/ciphers/enigma")


class EncryptResult(BaseModel):
    encrypted_text: str


class EncryptFromDbInput(BaseModel):
    text: str
    config_name: str


@router.post("/encrypt")
def encrypt(
    request: EnigmaInput,
) -> EncryptResult:
    enigma = setup_enigma(request)
    encrypted_text = enigma.encrypt(request.text)
    return EncryptResult(encrypted_text=encrypted_text)


@router.post("/encrypt/from_db")
def encrypt(
    request: EncryptFromDbInput,
    db: Session = Depends(get_db),
) -> EncryptResult:
    db_config = db.query(DBEnigmaConfig).filter(
        DBEnigmaConfig.name == request.config_name
    ).first()
    enigma = setup_enigma(db_config)
    encrypted_text = enigma.encrypt(request.text)
    return EncryptResult(encrypted_text=encrypted_text)



