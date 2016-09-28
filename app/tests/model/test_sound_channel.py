#!/usr/bin/env python
# -*- coding: utf-8 -*-

import unittest
from model.sound_channel import CurrentID

class TestCurrentID(unittest.TestCase):
    """Tests the CurrentId model"""

    def setUp(self):
        test_id = CurrentID(key_name="test")
        test_id._id = 0
        test_id.put()
        self.test_id = CurrentID.get_by_key_name("test")

    def test_increment(self):
        self.assertEqual(self.test_id.increment(), 1, "Increment returns\
                the incremented value")
        self.assertEqual(CurrentID.get_by_key_name("test")._id, 1, "Increment\
                stores the incremented value")
