#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging

from appengine_config import JINJA_ENVIRONMENT
from cirruslib.auth.decorators import check_auth

from cirruslib.handlers.base import BaseHandler


class MainAuthenticatedHandler(BaseHandler):

    URL = '/'

    @check_auth()
    def get(self):
        logging.debug('User: %s <%s>' % (self.user_display_name, self.user_email))

        template = JINJA_ENVIRONMENT.get_template('index.html')
        self.response.write(
            template.render({
                'user': {
                    'email': self.user_email,
                    'display_name': self.user_display_name,
                    'picture': self.user_picture
                }
            })
        )

