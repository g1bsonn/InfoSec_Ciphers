from pydantic import BaseModel, Field


class JeffersonConfig(BaseModel):
    num_disks: int = Field(examples=[36])
    key_row: int = Field(examples=[5])


class JeffersonInput(JeffersonConfig):
    text: str


class JeffersonDecryptInput(BaseModel):
    text: str
    decrypt_id: int

