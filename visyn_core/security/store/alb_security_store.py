import base64
import json
import logging
from functools import lru_cache
from typing import Any

import httpx
import jwt
from fastapi import Request

from ... import manager
from ..model import LogoutReturnValue, User
from .base_store import BaseStore

_log = logging.getLogger(__name__)


@lru_cache
def _get_public_key(region: str, key_id: str) -> str:
    return httpx.get(f"https://public-keys.auth.elb.{region}.amazonaws.com/{key_id}").text


class ALBSecurityStore(BaseStore):
    ui = "AutoLoginForm"

    def __init__(
        self,
        cookie_name: str | None,
        signout_url: str | None,
        email_token_field: str | list[str],
        properties_fields: list[str],
        audience: str | list[str] | None,
        issuer: str | None,
        decode_options: dict[str, Any] | None,
        region: str,
        decode_algorithms: list[str],
    ):
        self.cookie_name = cookie_name
        self.signout_url = signout_url
        self.email_token_fields = [email_token_field] if isinstance(email_token_field, str) else email_token_field
        self.properties_fields = properties_fields
        self.audience = audience
        self.issuer = issuer
        self.decode_options = decode_options
        self.region = region
        self.decode_algorithms = decode_algorithms

    def load_from_request(self, req: Request):
        # Get token data from header
        encoded_jwt = req.headers.get("X-Amzn-Oidc-Data", None)
        access_token = req.headers.get("X-Amzn-Oidc-Accesstoken", None)
        if encoded_jwt and access_token:
            try:
                _log.debug(f"Forwarded access token: {access_token}")
                _log.debug(f"Try to decode the oidc data jwt with payload: {encoded_jwt}")
                # Verification of the ALB token as it is outlined here: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html#user-claims-encoding
                # Get region from header, as we need the kid (key identifier) to get the public key
                jwt_headers = encoded_jwt.split(".")[0]
                decoded_jwt_headers = base64.b64decode(jwt_headers)
                decoded_jwt_headers = decoded_jwt_headers.decode("utf-8")
                decoded_json = json.loads(decoded_jwt_headers)
                key = _get_public_key(region=self.region, key_id=decoded_json["kid"])

                # Decode and pass all the options we have
                user = jwt.decode(
                    jwt=encoded_jwt,
                    key=key,
                    audience=self.audience,
                    issuer=self.issuer,
                    options=self.decode_options,
                    algorithms=self.decode_algorithms,
                )

                # Go through all the fields we want to check for the user id
                id = next((user.get(field, None) for field in self.email_token_fields if user.get(field, None)), None)
                if not id:
                    _log.error(f"No {self.email_token_fields} matched in token, possible values: {user}")
                    return None

                # Create new user from given attributes
                return User(
                    id=id,
                    roles=user.get("roles", []),
                    oauth2_access_token=access_token,
                    properties={key: user.get(key) for key in self.properties_fields},
                )
            except Exception:
                _log.exception("Error in load_from_request")
                return None
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
    if manager.settings.visyn_core.security.store.alb_security_store.enable:
        _log.info("Adding ALBSecurityStore")
        return ALBSecurityStore(
            cookie_name=manager.settings.visyn_core.security.store.alb_security_store.cookie_name,
            signout_url=manager.settings.visyn_core.security.store.alb_security_store.signout_url,
            email_token_field=manager.settings.visyn_core.security.store.alb_security_store.email_token_field,
            properties_fields=manager.settings.visyn_core.security.store.alb_security_store.properties_fields,
            audience=manager.settings.visyn_core.security.store.alb_security_store.audience,
            decode_options=manager.settings.visyn_core.security.store.alb_security_store.decode_options,
            region=manager.settings.visyn_core.security.store.alb_security_store.region,
            decode_algorithms=manager.settings.visyn_core.security.store.alb_security_store.decode_algorithms,
            issuer=manager.settings.visyn_core.security.store.alb_security_store.issuer,
        )

    return None
