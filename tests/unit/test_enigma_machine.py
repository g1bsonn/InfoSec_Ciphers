import unittest
from enigma.ciphers.enigma.main import Rotor, Reflector, Plugboard, EnigmaMachine
from enigma.ciphers.enigma.configs import ROTOR_CONFIGS, REFLECTOR_CONFIGS


class TestEnigmaMachine(unittest.TestCase):
    def setUp(self):
        # Создаем простую конфигурацию Энигмы
        rotors = [
            Rotor(**ROTOR_CONFIGS["I"], position=0, ring_setting=0),
            Rotor(**ROTOR_CONFIGS["II"], position=0, ring_setting=0),
            Rotor(**ROTOR_CONFIGS["III"], position=0, ring_setting=0)
        ]
        reflector = Reflector(REFLECTOR_CONFIGS["B"])
        plugboard = Plugboard([])
        self.enigma = EnigmaMachine(rotors, reflector, plugboard)

    def test_single_character_encryption(self):
        self.assertEqual(self.enigma.encrypt("A"), "F")  # Новое ожидаемое значение

    def test_full_encryption_decryption(self):
        text = "HELLO WORLD"
        encrypted = self.enigma.encrypt(text)

        # Сбрасываем позиции роторов
        for rotor in self.enigma.rotors:
            rotor.position = 0

        decrypted = self.enigma.encrypt(encrypted)
        self.assertEqual(decrypted, text)

    def test_rotation_mechanism(self):
        # Шифруем 5 символов (правый ротор должен повернуться 5 раз)
        self.enigma.encrypt("AAAAA")

        # Проверяем позиции роторов:
        self.assertEqual(self.enigma.rotors[0].position, 5)  # Правый ротор
        self.assertEqual(self.enigma.rotors[1].position, 0)  # Средний ротор (не должен вращаться)
        self.assertEqual(self.enigma.rotors[2].position, 0)  # Левый ротор