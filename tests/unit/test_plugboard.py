import unittest
from enigma.ciphers.enigma.main import Plugboard

class TestPlugboard(unittest.TestCase):
    def test_plugboard_swaps(self):
        plugboard = Plugboard([["A", "B"], ["C", "D"]])
        # A -> B
        self.assertEqual(plugboard.process(0), 1)
        # B -> A
        self.assertEqual(plugboard.process(1), 0)
        # C -> D
        self.assertEqual(plugboard.process(2), 3)
        # D -> C
        self.assertEqual(plugboard.process(3), 2)
        # E -> E (не меняется)
        self.assertEqual(plugboard.process(4), 4)
