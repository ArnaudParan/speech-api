#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging

from cirruslib.auth.decorators import check_auth

from cirruslib.handlers.base import BaseHandler


class StoreSound(BaseHandler):

    URL = '/store_sound'

    @check_auth()
    def post(self):
        logging.debug('User: %s <%s>' % (self.user_display_name, self.user_email))

        sound = self.request.get("sound")
        with open("t.wav", "wb") as f:
            f.write(sound.decode("base64"))
        self.response.write("ok")
