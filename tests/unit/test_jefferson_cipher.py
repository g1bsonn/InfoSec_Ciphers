import unittest
from enigma.ciphers.jefferson.main import JeffersonCipher


class TestJeffersonCipher(unittest.TestCase):
    def setUp(self):
        # Фиксированные диски для тестирования
        self.disks = [
            list("ZYXWVUTSRQPONMLKJIHGFEDCBA"),  # Обратный алфавит
            list("ABCDEFGHIJKLMNOPQRSTUVWXYZ"),  # Прямой алфавит
            list("BCDEFGHIJKLMNOPQRSTUVWXYZA")  # Со сдвигом
        ]
        self.cipher = JeffersonCipher(num_disks=3, disks=self.disks)
        self.cipher.disk_order = [0, 1, 2]  # Фиксированный порядок

    def test_encryption(self):
        # Шифрование с key_row=0
        self.assertEqual(
            self.cipher.encrypt("ABC", key_row=0),
            "ZBB"
        )

    def test_decryption(self):
        # Расшифровка с key_row=0
        self.assertEqual(
            self.cipher.decrypt("ZBB", key_row=0),
            "ABC"
        )

    def test_disk_order_effect(self):
        self.cipher.disk_order = [2, 1, 0]
        # Диск 2: B(0), C(1), D(2)... A(25)
        # A находится на позиции 25, берем символ из key_row=0 (B)
        self.assertEqual(
            self.cipher.encrypt("A", key_row=0),
            "Z"  # A(25) -> Z (первый символ диска 0)
        )

    def test_special_characters(self):
        # Для дисков:
        # Disk 0: ZYXWVUTSRQPONMLKJIHGFEDCBA
        # Disk 1: ABCDEFGHIJKLMNOPQRSTUVWXYZ
        # Disk 2: BCDEFGHIJKLMNOPQRSTUVWXYZA
        # Порядок [0,1,2], key_row=0
        self.assertEqual(
            self.cipher.encrypt("HELLO! WORLD?", key_row=0),
            "SEKOO! WNILC?"  # Актуальный результат для этой конфигурации
        )

    def test_case_insensitivity(self):
        self.assertEqual(
            self.cipher.encrypt("hello", key_row=0),
            self.cipher.encrypt("HELLO", key_row=0)
        )