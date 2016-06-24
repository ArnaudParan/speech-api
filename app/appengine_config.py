#!/usr/bin/env python
# -*- coding: utf-8 -*-

from google.appengine.ext import vendor
from os.path import dirname, join

from jinja2.environment import Environment
from jinja2.loaders import FileSystemLoader

vendor.add('libs')

ROOT_PATH = dirname(__file__)

JINJA_ENVIRONMENT = Environment(
    loader=FileSystemLoader(join(ROOT_PATH, 'templates')),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True
)