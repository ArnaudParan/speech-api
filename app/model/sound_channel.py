#!/usr/bin/env python
# -*- coding: utf-8 -*-

from google.appengine.ext import db

class SoundChannel(db.Model):
    pass

class CurrentID(db.Model):
    _id = db.IntegerProperty()

    def increment(self):
        self._id += 1
        self.put()
        return self._id
