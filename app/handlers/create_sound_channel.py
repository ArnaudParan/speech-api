#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import os
import json

from google.appengine.api import channel
from google.cloud.speech.v1beta1 import cloud_speech_pb2
from six.moves import queue

from cirruslib.auth.decorators import check_auth
from cirruslib.handlers.base import BaseHandler
from cirruslib.settings import PROTOCOL

from utils.globals import SERVICE_URL
from utils.sound_uploader import SoundUploader, SOUND_UPLOADERS
from utils.transcribe_streaming import SoundProcessor
from model.sound_channel import SoundChannel, CurrentID

class CreateSoundChannel(BaseHandler):

    URL = SERVICE_URL + '/create_sound_channel'

    @check_auth()
    def get(self):
        """Creates a channel to be able to push resutls to the client asynchronously,
        stores some identifiers for the channel. Creates a thread which does the speech api requests
        and handles the responses"""
        logging.debug('User: %s <%s>' % (self.user_display_name, self.user_email))

        # gets the current id if it exists, creates one else
        current_id = CurrentID.get_by_key_name("0")
        if not current_id:
            current_id = CurrentID(key_name="0")
            current_id._id = 0
            current_id.put()
        transaction_key = str(current_id.increment())

        # Creates the thread which is going to store the audio data as it comes from the client
        SOUND_UPLOADERS[transaction_key] = {
                "sound_uploader": SoundUploader(transaction_key, SOUND_UPLOADERS)
                }
        SOUND_UPLOADERS[transaction_key]["sound_uploader"].start()

        # Creates an element in datastore in case we would have to store data for the channel one day
        sound_channel = SoundChannel(key_name=transaction_key)
        sound_channel.put()

        # Creates the channel
        token = channel.create_channel(transaction_key)

        # Creates the thread which is going to send requests and parse results from speech api
        def send_message(message):
            channel.send_message(token, json.dumps({"message": message}))
        sound_processor = SoundProcessor(SOUND_UPLOADERS[transaction_key]["sound_uploader"].data_list, 16000, send_message)
        sound_processor.start()

        self.response.write(json.dumps({"token": token, "key": transaction_key}))
