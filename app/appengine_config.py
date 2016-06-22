#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os

from google.appengine.ext import vendor

current_working_directory = os.path.dirname(__file__)

vendor.add('libs')
