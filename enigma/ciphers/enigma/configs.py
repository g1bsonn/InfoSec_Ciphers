from typing import Literal

from pydantic import BaseModel, Field


class EnigmaConfig(BaseModel):
    rotors: list[Literal["III", "II", "I"]] = Field(example=["III", "II", "I"])
    reflector: Literal["B", "C"] = Field(examples=["B"])
    ring_settings: list[int] = Field(examples=[[0, 0, 0]])
    initial_positions: str = Field(examples=["AAA"])
    plugboard_pairs: list[list[str]] = Field(examples=[[["A","B"], ["C","D"]]])


class EnigmaInput(EnigmaConfig):
    text: str


ROTOR_CONFIGS = {
    "I": {
        "wiring": "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
        "notch": "Q"
    },
    "II": {
        "wiring": "AJDKSIRUXBLHWTMCQGZNPYFVOE",
        "notch": "E"
    },
    "III": {
        "wiring": "BDFHJLCPRTXVZNYEIWGAKMUSQO",
        "notch": "V"
    }
}

# Предопределенные рефлекторы
REFLECTOR_CONFIGS = {
    "B": "YRUHQSLDPXNGOKMIEBFZCWVJAT",
    "C": "FVPJIAOYEDRZXWGCTKUQSBNMHL"
}
