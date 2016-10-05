#!/usr/bin/env python
# -*- coding: utf-8 -*-

from six.moves import queue

from utils.data_thread import DataThread

class SoundUploader(DataThread):
    """The audio buffer class, it waits for data updates
    and pushes it to a queue element. its timeout is 2 seconds"""
    def __init__(self, key, channel_dict):
        DataThread.__init__(self)
        self.data_list = queue.Queue()
        self.timeout = 2
        self.key = key
        self.channel_dict = channel_dict

    def handle_data(self):
        self.data_list.put(self.data)

    def on_stop(self):
        self.data_list.put(None)
        #del self.channel_dict[self.key]

try:
    SOUND_UPLOADERS
except NameError:
    SOUND_UPLOADERS = {}
