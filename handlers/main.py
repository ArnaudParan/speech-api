#!/usr/bin/env python
# -*- coding: utf-8 -*-

from webapp2 import RequestHandler
from cirruslib.auth.decorators import check_auth


class MainAuthenticatedHandler(RequestHandler):

    @check_auth()
    def get(self):
        self.response.write('Hello %s !' % self.user_email)

