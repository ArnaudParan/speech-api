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
from model.sound_channel import SoundChannel, CurrentID

class CreateSoundChannel(BaseHandler):

    URL = SERVICE_URL + '/create_sound_channel'

    @check_auth()
    def get(self):
        """Creates an key to recognise the stream, as well as a channel, and connects to speech api"""
        logging.debug('User: %s <%s>' % (self.user_display_name, self.user_email))

        current_id = CurrentID.get_by_key_name("0")
        if not current_id:
            current_id = CurrentID(key_name="0")
            current_id._id = 0
            current_id.put()
        transaction_key = str(current_id.increment())
        sound_channel = SoundChannel(key_name=transaction_key)
        sound_channel.put()

        recognition_config = cloud_speech_pb2.RecognitionConfig(encoding="LINEAR16")
        streaming_config = cloud_speech_pb2.StreamingRecognitionConfig(config=recognition_config)
        cloud_speech_pb2.StreamingRecognizeRequest(streaming_config=streaming_config)

        self.response.write(json.dumps({"key": transaction_key}))
