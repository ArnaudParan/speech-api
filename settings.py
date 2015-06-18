#!/usr/bin/env python
# -*- coding: utf-8 -*-

### TODO You modify with your project own credentials information ###
from google.appengine.api import app_identity, modules

CLIENT_ID = 'MyClientId'
SERVICE_ACCOUNT = 'MyServiceAccount'
SCOPES = [
    'MyScope1',
    'MyScope2',
]
PRIVATE_KEY_FILENAME = 'MyPrivateKeyFilename.pem'

### You can modify these values but it will break any warranty that comes with this Framework ! ###
USER_AGENT = '%s/%s' % (
    app_identity.get_application_id(),
    modules.get_current_version_name()
)
PRIVATE_KEY_PATH = 'key/%s' % PRIVATE_KEY_FILENAME

### You should not have to modify this. Actually just don't ! ###
GOOGLE_API_SETTINGS = {
    'pem_private_key_path': PRIVATE_KEY_PATH,
    'client_id': CLIENT_ID,
    'service_account': SERVICE_ACCOUNT,
    'user_agent': USER_AGENT,
    'scopes': SCOPES
}
