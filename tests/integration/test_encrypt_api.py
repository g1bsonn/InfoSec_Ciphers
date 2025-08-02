from fastapi.testclient import TestClient
from enigma.main import app

client = TestClient(app)


def test_enigma_encrypt():
    # Подготовка тестовых данных
    test_data = {
        "rotors": ["III", "II", "I"],
        "reflector": "B",
        "ring_settings": [0, 0, 0],
        "initial_positions": "AAA",
        "plugboard_pairs": [],
        "text": "HELLO"
    }

    # Отправка запроса
    response = client.post("/ciphers/enigma/encrypt", json=test_data)

    # Проверки
    assert response.status_code == 200
    assert "encrypted_text" in response.json()