#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Creates the unit tests report"""

import logging
import unittest
import glob
import StringIO
import HTMLTestRunner

from cirruslib.auth.decorators import check_auth

from cirruslib.handlers.base import BaseHandler

class Test(BaseHandler):
    """Class which handles the unit test html reporting"""

    URL = '/test'

    @check_auth()
    def get(self):
        """Handles the get reqests, searches for all the test_* files in the test dir,
        executes it, and then creates an html report"""
        logging.debug('User: %s <%s>' % (self.user_display_name, self.user_email))

        test_files = glob.glob('tests/**/test_*.py')
        module_strings = [test_file[0:len(test_file)-3].replace("/", ".")\
                for test_file in test_files]
        suites = [unittest.defaultTestLoader.loadTestsFromName(test_file)\
                for test_file in module_strings]
        test_suite = unittest.TestSuite(suites)
        output = StringIO.StringIO()
        runner = HTMLTestRunner.HTMLTestRunner(
            stream=output,
            title="Test Report",
            description="Test")
        runner.run(test_suite)

        self.response.write(output.getvalue())

