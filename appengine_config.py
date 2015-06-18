#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys

current_working_directory = os.path.dirname(__file__)

sys.path.extend([
    os.path.join(
        current_working_directory,
        'libs/cirruseo_custom_framework/dependencies/gdata-2.0.18'
    ),
    os.path.join(
        current_working_directory,
        'libs/cirruseo_custom_framework/dependencies/google-api-python-client-gae-1.2'
    ),
    os.path.join(
        current_working_directory,
        'libs/cirruseo_custom_framework/dependencies/cirruseo_api_utils'
    ),
    os.path.join(
        current_working_directory,
        'libs/cirruseo_custom_framework'
    )
])
