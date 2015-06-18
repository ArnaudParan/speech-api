#!/usr/bin/env python
# -*- coding: utf-8 -*-

from google.appengine.api import app_identity, modules
from cirruslib.handlers.auth.callback import OAuth2FmkCallback

# App auth settings
# TODO Generate a Web Application Client ID for your project and change the following values
CLIENT_ID = 'MyClientId'
CLIENT_SECRET = 'MyClientSecret'
OAUTH2_CALLBACK = OAuth2FmkCallback.URL

# API auth settings
# TODO Generate a Service Account Client ID for your project and change the following values
SERVICE_ACCOUNT_CLIENT_ID = 'MyServiceAccountClientId'
SERVICE_ACCOUNT = 'MyServiceAccount'
SCOPES = [
    'MyScope1',
    'MyScope2'
]
PRIVATE_KEY_FILENAME = 'MyPrivateKeyFilename.pem'

# !!! You can modify these values but it will break any warranty that comes with this Framework !!!
USER_AGENT = '%s/%s' % (
    app_identity.get_application_id(),
    modules.get_current_version_name()
)
PRIVATE_KEY_PATH = 'key/%s' % PRIVATE_KEY_FILENAME

# !!! You should not have to modify this. Actually just don't !!!
GOOGLE_API_SETTINGS = {
    'pem_private_key_path': PRIVATE_KEY_PATH,
    'client_id': CLIENT_ID,
    'service_account': SERVICE_ACCOUNT,
    'user_agent': USER_AGENT,
    'scopes': SCOPES
}

# TODO Change these customer specific settings
DOMAIN = ''
ADMIN_EMAIL = ''


