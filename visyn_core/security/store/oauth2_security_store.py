import logging

import jwt
from fastapi import Request

from ... import manager
from ..model import LogoutReturnValue, User
from .base_store import BaseStore

_log = logging.getLogger(__name__)


class OAuth2SecurityStore(BaseStore):
    ui = "AutoLoginForm"

    def __init__(self, cookie_name: str | None, signout_url: str | None, email_token_field: str | list[str], properties_fields: list[str]):
        self.cookie_name = cookie_name
        self.signout_url: str | None = signout_url
        self.email_token_fields = [email_token_field] if isinstance(email_token_field, str) else email_token_field
        self.properties_fields = properties_fields

    def load_from_request(self, req: Request):
        token_field = manager.settings.visyn_core.security.store.oauth2_security_store.access_token_header_name
        try:
            # Get token data from header
            access_token = req.headers.get(token_field)
            if access_token:
                _log.debug(f"Try to decode the oidc data jwt with access token: {access_token}")
                user = jwt.decode(access_token, options={"verify_signature": False})

                # Go through all the fields we want to check for the user id
                id = next((user.get(field, None) for field in self.email_token_fields if user.get(field, None)), None)
                if not id:
                    _log.error(f"No {self.email_token_fields} matched in token, possible values: {user}")
                    return None

                # Create new user from given attributes
                return User(
                    id=id,
                    roles=[],
                    oauth2_access_token=access_token,
                    properties={key: user.get(key) for key in self.properties_fields},
                )
        except Exception:
            _log.exception("Error in load_from_request")
            return None

    def logout(self, user):
        # https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html#authentication-logout
        cookies = []
        if self.cookie_name:
            cookies.append({"key": self.cookie_name, "value": "", "expires": -1})
        payload = {}
        # Redirect-URL to be triggered after logout. Makes sure to properly logout of the IdP provider.
        # See https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-protocols-oidc#send-a-sign-out-request for details.
        if self.signout_url:
            payload["redirect"] = self.signout_url

        return LogoutReturnValue(data=payload, cookies=cookies)


def create():
    # Check if the security store is enabled.
    # Why do we do this here and not in the __init__.py?
    # Because the configuration is merged after the registry is loaded,
    # such that no keys are available (except visyn_core keys).
    if manager.settings.visyn_core.security.store.oauth2_security_store.enable:
        _log.info("Adding OAuth2SecurityStore")
        return OAuth2SecurityStore(
            cookie_name=manager.settings.visyn_core.security.store.oauth2_security_store.cookie_name,
            signout_url=manager.settings.visyn_core.security.store.oauth2_security_store.signout_url,
            email_token_field=manager.settings.visyn_core.security.store.oauth2_security_store.email_token_field,
            properties_fields=manager.settings.visyn_core.security.store.oauth2_security_store.properties_fields,
        )

    return None
