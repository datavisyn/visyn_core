import logging

import jwt
from fastapi import Request

from ... import manager
from ...settings.model import OAuth2SecurityStoreHeader
from ..model import LogoutReturnValue, User
from .base_store import BaseStore

_log = logging.getLogger(__name__)


class OAuth2SecurityStore(BaseStore):
    ui = "AutoLoginForm"

    def __init__(
        self,
        token_field: str | None,
        cookie_name: str | list[str] | None,
        signout_url: str | None,
        email_token_field: str | list[str] | None,
        properties_fields: list[str] | None,
        token_headers: list[OAuth2SecurityStoreHeader],
    ):
        self.cookie_name = [cookie_name] if isinstance(cookie_name, str) else cookie_name
        self.signout_url: str | None = signout_url
        # Define the list of token headers to be tried
        self.token_headers = []

        # Add the token headers to the list of new token headers
        self.token_headers.extend(token_headers)

        # Legacy fields for backwards compatibility
        if token_field:
            # Add the token field to the list of token headers
            self.token_headers.append(
                OAuth2SecurityStoreHeader(
                    name=token_field,
                    email_fields=([email_token_field] if isinstance(email_token_field, str) else email_token_field) or [],
                    properties_fields=properties_fields or [],
                )
            )

    def _load_user_from_token_header(self, req: Request, token_header: OAuth2SecurityStoreHeader):
        # Get token data from header
        _log.debug(f"Token header: {token_header}")
        access_token = req.headers.get(token_header.name)
        _log.debug(f"Token value: {access_token}")
        if access_token:
            # Remove any leading "Bearer " if exists
            if access_token.startswith("Bearer "):
                access_token = access_token.replace("Bearer ", "", 1)

            user = jwt.decode(access_token, options={"verify_signature": False})

            _log.debug(f"Decoded token: {user}")

            # Go through all the fields we want to check for the user id
            id = next((user.get(field, None) for field in token_header.email_fields if user.get(field, None)), None)
            if not id:
                _log.error(f"No {token_header.email_fields} matched in token, possible values: {user}")
                return None

            _log.debug(f"User id: {id}")
            # Create new user from given attributes
            return User(
                id=id,
                roles=[],
                oauth2_access_token=access_token,
                properties={key: user.get(key) for key in token_header.properties_fields},
            )

    def load_from_request(self, req: Request):
        for token_header in self.token_headers:
            try:
                user = self._load_user_from_token_header(req, token_header)
                if user:
                    return user
            except Exception:
                _log.exception("Error in load_from_request")
                return None

    def logout(self, user):
        # https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html#authentication-logout
        cookies = []
        if self.cookie_name:
            for name in self.cookie_name:
                cookies.append({"key": name, "value": "", "expires": -1})
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
            token_field=manager.settings.visyn_core.security.store.oauth2_security_store.access_token_header_name,
            cookie_name=manager.settings.visyn_core.security.store.oauth2_security_store.cookie_name,
            signout_url=manager.settings.visyn_core.security.store.oauth2_security_store.signout_url,
            email_token_field=manager.settings.visyn_core.security.store.oauth2_security_store.email_token_field,
            properties_fields=manager.settings.visyn_core.security.store.oauth2_security_store.properties_fields,
            token_headers=manager.settings.visyn_core.security.store.oauth2_security_store.token_headers,
        )

    return None
