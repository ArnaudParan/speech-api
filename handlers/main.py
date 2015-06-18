#!/usr/bin/env python
# -*- coding: utf-8 -*-

from webapp2 import RequestHandler


class MainAuthenticatedHandler(RequestHandler):

    def get(self):
        self.response.write('Hello world!')