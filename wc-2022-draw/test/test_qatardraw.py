import unittest
from qatardraw import pot_permutations, draw_pot

class PotPermutationsTestCase(unittest.TestCase):

    def test_pot_1(self):
        self.assertEqual(
            pot_permutations('SSEEEEE', 'A'),
            (
                'AEEEEESS', 'AEEEESES', 'AEEEESSE', 'AEEESEES', 'AEEESESE',
                'AEEESSEE', 'AEESEEES', 'AEESEESE', 'AEESESEE', 'AEESSEEE',
                'AESEEEES', 'AESEEESE', 'AESEESEE', 'AESESEEE', 'AESSEEEE',
                'ASEEEEES', 'ASEEEESE', 'ASEEESEE', 'ASEESEEE', 'ASESEEEE',
                'ASSEEEEE',
            )
        )

    def test_multiple_confederations(self):
        self.assertEqual(
            pot_permutations('ABBC'),
            (
                'ABBC', 'ABCB', 'ACBB', 'BABC', 'BACB', 'BBAC',
                'BBCA', 'BCAB', 'BCBA', 'CABB', 'CBAB', 'CBBA',
            )
        )

class DrawPotTestCase(unittest.TestCase):

    def test_pot_1(self):
        self.assertEqual(
            draw_pot('AEEEEESS'),
            ('A', 'E', 'E', 'E', 'E', 'E', 'S', 'S')
        )

    def test_pot_2_simple(self):
        self.assertEqual(
            draw_pot('EEEEESNN', ('A', 'E', 'E', 'E', 'E', 'E', 'S', 'S')),
            ('AE', 'EE', 'EE', 'EE', 'EE', 'ES', 'SN', 'SN')
        )

    def test_pot_2_clash(self):
        self.assertEqual(
            draw_pot('EEEEESNN', ('A', 'E', 'E', 'E', 'E', 'S', 'E', 'S')),
            ('AE', 'EE', 'EE', 'EE', 'EE', 'SN', 'ES', 'SN')
        )

    def test_pot_3_simple(self):
        self.assertEqual(
            draw_pot('FAAANFEE', ('AE', 'EE', 'EE', 'EE', 'EE', 'ES', 'SN', 'SN')),
            ('AEF', 'EEA', 'EEA', 'EEA', 'EEN', 'ESF', 'SNE', 'SNE')
        )

    def test_pot_3_clash(self):
        self.assertEqual(
            draw_pot('AAAFNFEE', ('AE', 'EE', 'EE', 'EE', 'EE', 'ES', 'SN', 'SN')),
            ('AEF', 'EEA', 'EEA', 'EEA', 'EEN', 'ESF', 'SNE', 'SNE')
        )

    def test_pot_3_end_clash(self):
        self.assertEqual(
            draw_pot('FAAAFEEN', ('AE', 'EE', 'EE', 'EE', 'EE', 'ES', 'SN', 'SN')),
            ('AEF', 'EEA', 'EEA', 'EEA', 'EEF', 'ESN', 'SNE', 'SNE')
        )

    def test_pot_3_six_double_europes(self):
        self.assertEqual(
            draw_pot('ENAAAEFF', ('AE', 'EE', 'EE', 'EE', 'EE', 'ES', 'SN', 'SN')),
            ('AEE', 'EEN', 'EEA', 'EEA', 'EEA', 'ESF', 'SNE', 'SNF')
        )

    def test_pot_4_simple(self):
        self.assertEqual(
            draw_pot('FPFSNAFE', ('AEE', 'EEN', 'EEA', 'EEA', 'EEA', 'ESF', 'SNE', 'SNF')),
            ('AEEF', 'EENP', 'EEAF', 'EEAS', 'EEAN', 'ESFA', 'SNEF', 'SNFE')
        )

    def test_pot_4_clash(self):
        self.assertEqual(
            draw_pot('FPFSANFE', ('AEE', 'EEN', 'EEA', 'EEA', 'EEA', 'ESF', 'SNE', 'SNF')),
            ('AEEF', 'EENP', 'EEAF', 'EEAS', 'EEAN', 'ESFA', 'SNEF', 'SNFE')
        )

    def test_pot_4_end_clash(self):
        self.assertEqual(
            draw_pot('FPFSNAEF', ('AEE', 'EEN', 'EEA', 'EEA', 'EEA', 'ESF', 'SNE', 'SNF')),
            ('AEEF', 'EENP', 'EEAF', 'EEAS', 'EEAN', 'ESFA', 'SNEF', 'SNFE')
        )

    def test_pot_4_six_double_europes(self):
        self.assertEqual(
            draw_pot('FPFSNEFA', ('AEE', 'EEN', 'EEA', 'EEA', 'EEA', 'ESF', 'SNE', 'SNF')),
            ('AEEF', 'EENP', 'EEAF', 'EEAS', 'EEAN', 'ESFA', 'SNEF', 'SNFE')
        )

    def test_pot_4_two_predetermined(self):
        self.assertEqual(
            draw_pot('PEFFFSNA', ('AEE', 'EEA', 'ESN', 'EEA', 'EEA', 'SEF', 'SNF', 'ENE')),
            ('AEEF', 'EEAF', 'ESNF', 'EEAS', 'EEAN', 'SEFA', 'SNFE', 'ENEP')
        )

    def test_all_four_pots_at_once(self):
        self.assertEqual(
            draw_pot('ASSEEEEESNNEEEEEAAAFFNEEAFFFNPSE'),
            ('ASEF', 'SNAE', 'SNEA', 'EEAF', 'EEAF', 'EEFN', 'EEFP', 'EENS')
        )
