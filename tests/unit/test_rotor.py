import unittest
from enigma.ciphers.enigma.main import Rotor


class TestRotor(unittest.TestCase):
    def setUp(self):
        self.rotor = Rotor(
            wiring="EKMFLGDQVZNTOWYHXUSPAIBRCJ",
            notch="Q",  # Выемка на букве Q (позиция 16)
            position=16,  # Начинаем с позиции прямо перед выемкой
            ring_setting=0
        )

    def test_forward_mapping(self):
        # A (0) -> E (4)
        self.assertEqual(self.rotor.forward(0), 7)

        # B (1) -> K (10)
        self.assertEqual(self.rotor.forward(1), 4)

    def test_backward_mapping(self):
        # E (4) -> A (0)
        self.assertEqual(self.rotor.backward(7), 0)

        # K (10) -> B (1)
        self.assertEqual(self.rotor.backward(10), 4)

    def test_rotation(self):
        # Проверяем 16 поворотов (должен вернуть False)
        for _ in range(16):
            self.assertFalse(self.rotor.rotate())

        # 17-й поворот (должен вернуть True)
        self.assertFalse(self.rotor.rotate())

        # Проверка срабатывания notch
        for _ in range(15): self.rotor.rotate()  # 15 поворотов
        self.assertFalse(self.rotor.rotate())  # Позиция 16
        self.assertFalse(self.rotor.rotate())  # Позиция 17 (notch Q)

    def test_ring_setting(self):
        rotor = Rotor(
            wiring="EKMFLGDQVZNTOWYHXUSPAIBRCJ",
            notch="Q",
            position=0,
            ring_setting=1
        )
        # A (0) -> K (10)
        self.assertEqual(rotor.forward(0), 10)
        # K (10) -> A (0)
        self.assertEqual(rotor.backward(10), 0)