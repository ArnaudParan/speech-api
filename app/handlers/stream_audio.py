#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import os
import json

from google.cloud.speech.v1beta1 import cloud_speech_pb2

from cirruslib.auth.decorators import check_auth
from cirruslib.handlers.base import BaseHandler
from cirruslib.settings import PROTOCOL

from utils.globals import SERVICE_URL
from utils.sound_uploader import SOUND_UPLOADERS
from model.sound_channel import SoundChannel

class StreamAudio(BaseHandler):

    URL = SERVICE_URL + '/stream_audio'

    @check_auth()
    def post(self):
        """Streams some audio data to speech api"""
        logging.debug('User: %s <%s>' % (self.user_display_name, self.user_email))

        transaction_key = self.request.get("key")
        if not transaction_key:
            self.response.write({"error": "no key given please ask a key at /service/create_sound_channel"})
            self.response.set_status(403, message="no key given, please ask one at /service/create_sound_channel")
            return
        sound_channel = SoundChannel.get_by_key_name(transaction_key)
        if not sound_channel:
            self.response.write({"error": "incorrect key, no channel matches it"})
            self.response.set_status(403, message="incorrect key, no channel matches it")
            return
        if not transaction_key in SOUND_UPLOADERS:
            self.response.write({"error": "incorrect key, thread does not exist anymore"})
            self.response.set_status(403, message="incorrect key, thread does not exist anymore")
            return

        sound = self.request.get("sound")
        SOUND_UPLOADERS[transaction_key]["sound_uploader"].push_data(sound.encode("base64"))

        self.response.write(json.dumps({"ok": "ok"}))
