import unittest
from enigma.ciphers.enigma.main import Reflector

class TestReflector(unittest.TestCase):
    def test_reflection(self):
        reflector = Reflector("YRUHQSLDPXNGOKMIEBFZCWVJAT")
        # A (0) -> Y (24)
        self.assertEqual(reflector.reflect(0), 24)
        # B (1) -> R (17)
        self.assertEqual(reflector.reflect(1), 17)
        # Z (25) -> T (19)
        self.assertEqual(reflector.reflect(25), 19)
