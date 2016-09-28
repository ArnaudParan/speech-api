#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import os
import json

from google.appengine.api import channel
from google.cloud.speech.v1beta1 import cloud_speech_pb2

from cirruslib.auth.decorators import check_auth
from cirruslib.handlers.base import BaseHandler
from cirruslib.settings import PROTOCOL

from utils.globals import SERVICE_URL
from model.sound_channel import SoundChannel

class StreamAudio(BaseHandler):

    URL = SERVICE_URL + '/stream_audio'

    @check_auth()
    def get(self):
        """Creates an key to recognise the stream, as well as a channel, and connects to speech api"""
        logging.debug('User: %s <%s>' % (self.user_display_name, self.user_email))

        transaction_key = self.request.get("key")
        if not transaction_key:
            self.response.write({"error": "no key given please ask a key at /service/create_sound_channel"})
            return
        sound_channel = SoundChannel.get_by_key_name(transaction_key)
        if not sound_channel:
            self.response.write({"error": "incorrect key, no channel matches it"})
            return

        channel.send_message(transaction_key, json.dumps({"ok": "ok"}))

        self.response.write(json.dumps({"ok": "ok"}))
