#!/usr/bin/env python
# -*- coding: utf-8 -*-
#!/usr/bin/env python
# -*- coding: utf-8 -*-

from webapp2 import WSGIApplication, Route

from cirruslib.handlers.auth.callback import OAuth2FmkCallback

from handlers.main import MainAuthenticatedHandler

from cirruslib.handlers.sync.users import UsersSync, UserWatchChecker, UserChangeReceiver
from cirruslib.handlers.sync.groups import GroupsSync, SubGroupsSync, MembersSync, IndirectMembersSync, \
    UpdateUserGroupsSync

### These handlers allow you o have up to date users and groups ###

FRAMEWORK_HANDLERS = [
    (UsersSync.URL, UsersSync),
    (UserWatchChecker.URL, UserWatchChecker),
    (UserChangeReceiver.URL, UserChangeReceiver),
    (GroupsSync.URL, GroupsSync),
    (SubGroupsSync.URL, SubGroupsSync),
    (UpdateUserGroupsSync.URL, UpdateUserGroupsSync),
    (MembersSync.URL, MembersSync),
    (IndirectMembersSync.URL, IndirectMembersSync),
    (OAuth2FmkCallback.URL, OAuth2FmkCallback)
]

APPLICATION_HANDLERS = [
    (MainAuthenticatedHandler.URL, MainAuthenticatedHandler)
]

app = WSGIApplication(
    FRAMEWORK_HANDLERS + APPLICATION_HANDLERS,
    debug=True
)
