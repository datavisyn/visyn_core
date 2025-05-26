import logging

import jwt
from fastapi import Request

from ... import manager
from ...settings.model import OAuth2SecurityStoreHeader, OAuth2SecurityStoreSettings
from ..model import LogoutReturnValue, User
from .base_store import BaseStore

_log = logging.getLogger(__name__)


class OAuth2SecurityStore(BaseStore):
    ui = "AutoLoginForm"

    def __init__(
        self,
        settings: OAuth2SecurityStoreSettings,
    ):
        self.cookie_name = [settings.cookie_name] if isinstance(settings.cookie_name, str) else settings.cookie_name
        self.signout_url: str | None = settings.signout_url
        self.use_user_headers = settings.use_user_headers
        self.user_email_header = settings.user_email_header
        self.user_groups_header = settings.user_groups_header

        # Define the list of token headers to be tried
        self.token_headers: list[OAuth2SecurityStoreHeader] = []

        # Add the token headers to the list of new token headers
        self.token_headers.extend(settings.token_headers)

        # Legacy fields for backwards compatibility
        if settings.access_token_header_name:
            # Add the token field to the list of token headers
            self.token_headers.append(
                OAuth2SecurityStoreHeader(
                    name=settings.access_token_header_name,
                    email_fields=(
                        [settings.email_token_field] if isinstance(settings.email_token_field, str) else settings.email_token_field
                    )
                    or [],
                    roles_fields=(
                        [settings.roles_token_field] if isinstance(settings.roles_token_field, str) else settings.roles_token_field
                    )
                    or [],
                    properties_fields=settings.properties_fields or [],
                )
            )

    def _load_user_from_token_header(self, req: Request, token_header: OAuth2SecurityStoreHeader):
        # Get token data from header
        access_token = req.headers.get(token_header.name)
        _log.debug(f"Access token header: {token_header.name} and value: {access_token}")

        if self.use_user_headers:
            user_email = req.headers.get(self.user_email_header)
            user_groups = req.headers.get(self.user_groups_header)
            _log.debug(f"User email header: {self.user_email_header} and value: {user_email}")
            _log.debug(f"NOT USED: User groups header: {self.user_groups_header} and value: {user_groups}")

            if user_email:
                return User(
                    id=user_email,
                    roles=[],  # TODO: What's the possible formats of user groups?
                    access_token=access_token,
                )

        if access_token:
            # Remove any leading "Bearer " if exists
            if access_token.startswith("Bearer "):
                access_token = access_token.replace("Bearer ", "", 1)

            access_token_payload = jwt.decode(access_token, options={"verify_signature": False})
            _log.debug(f"Access token payload: {access_token_payload}")

            # Go through all the fields we want to check for the user id
            id = next(
                (access_token_payload.get(field, None) for field in token_header.email_fields if access_token_payload.get(field, None)),
                None,
            )
            if not id:
                _log.warning(f"No {token_header.email_fields} matched in token, possible values: {access_token_payload}")
                return None

            # Go through all the fields we want to check for the user id
            roles = next(
                (
                    access_token_payload.get(field, None)
                    for field in token_header.roles_fields
                    if access_token_payload.get(field, None) and isinstance(access_token_payload.get(field, None), list)
                ),
                None,
            )

            _log.debug(f"User id: {id} and roles: {roles}")
            # Create new user from given attributes
            return User(
                id=id,
                roles=roles or [],
                oauth2_access_token=access_token,
                properties={key: access_token_payload.get(key) for key in token_header.properties_fields},
            )

    def load_from_request(self, req: Request):
        for token_header in self.token_headers:
            try:
                user = self._load_user_from_token_header(req, token_header)
                if user:
                    return user
            except Exception as e:
                _log.warning(f"Error loading user from token header {token_header.name}: {e}")
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
            settings=manager.settings.visyn_core.security.store.oauth2_security_store,
        )

    return None
