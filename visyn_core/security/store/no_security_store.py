import logging
from typing import Any

from ... import manager
from ..model import User
from .base_store import BaseStore

_log = logging.getLogger(__name__)


class NoSecurityStore(BaseStore):
    def __init__(self, user: str, roles: list[str], properties: dict[str, Any]):
        self.user = user
        self.roles = roles
        self.properties = properties

    def load_from_request(self, req):
        return User(id=self.user, roles=self.roles, properties=self.properties)


def create():
    # Check if the security store is enabled.
    # Why do we do this here and not in the __init__.py?
    # Because the configuration is merged after the registry is loaded,
    # such that no keys are available (except visyn_core keys).
    if manager.settings.visyn_core.security.store.no_security_store.enable:
        _log.info("Adding NoSecurityStore")
        return NoSecurityStore(
            user=manager.settings.visyn_core.security.store.no_security_store.user,
            roles=manager.settings.visyn_core.security.store.no_security_store.roles,
            properties=manager.settings.visyn_core.security.store.no_security_store.properties,
        )

    return None
