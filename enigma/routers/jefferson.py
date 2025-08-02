from fastapi import APIRouter
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from enigma.db import DBJeffersonConfig, get_db
from enigma.ciphers.jefferson import setup_jefferson, JeffersonInput, JeffersonDecryptInput


router = APIRouter(prefix="/ciphers/jefferson")


class EncryptResult(BaseModel):
    encrypted_text: str
    encrypt_id: int


class DecryptResult(BaseModel):
    decrypted_text: str


@router.post("/encrypt")
def encrypt_jefferson(
    request: JeffersonInput,
    db: Session = Depends(get_db),
) -> EncryptResult:
    jefferson = setup_jefferson(request)
    encrypted_text = jefferson.encrypt(request.text, request.key_row)

    db_config = DBJeffersonConfig(
        disks=jefferson.disks,
        secret_key=jefferson.get_key(),
        num_disks=request.num_disks,
        key_row=request.key_row
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)

    return EncryptResult(encrypted_text=encrypted_text, encrypt_id=db_config.id)


@router.post("/decrypt")
def encrypt_jefferson(
    request: JeffersonDecryptInput,
    db: Session = Depends(get_db),
) -> DecryptResult:
    config = db.query(DBJeffersonConfig).filter(
        DBJeffersonConfig.id == request.decrypt_id
    ).first()

    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    
    jefferson = setup_jefferson(config, disks=config.disks)
    jefferson.set_disk_order(config.secret_key)
    decrypted_text = jefferson.decrypt(request.text, config.key_row)
    return DecryptResult(decrypted_text=decrypted_text)
