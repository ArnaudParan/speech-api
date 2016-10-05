#!/usr/bin/env python
# -*- coding: utf-8 -*-

import threading

from google.appengine.api.background_thread.background_thread import BackgroundThread

class DataThread(BackgroundThread):
    """class to create a thread waiting for data to update. The threads waits for
    someone to send data with thread.push_data(data) and then treats it with the
    handle_data function. The data is stored in self.data and if handle_data returns
    False, on_stop is called and the thread is stopped. If no data is given during
    self.timeout, on_stop is called and the thread is stopped."""
    def __init__(self):
        threading.Thread.__init__(self)
        self.event = threading.Event()
        self.timeout = 60 * 5

    def run(self):
        while True:
            self.event.clear()
            self.event.wait(self.timeout)
            if not self.event.is_set():
                if hasattr(self, "on_stop"):
                    self.on_stop()
                break
            if self.handle_data():
                if hasattr(self, "on_stop"):
                    self.on_stop()
                break

    def handle_data(self):
        """Function to redefine, it will handle the data, if you want the thread to
        stop, make it return true, else it should return true"""
        raise Exception("Function handling the data not defined")

    def push_data(self, data):
        self.data = data
        self.event.set()
