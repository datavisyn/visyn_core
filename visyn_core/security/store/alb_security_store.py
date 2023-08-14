import base64
import json
import logging
from functools import lru_cache

import httpx
import jwt
from fastapi import Request

from ... import manager
from ..model import LogoutReturnValue, User
from .base_store import BaseStore

_log = logging.getLogger(__name__)


@lru_cache
def _get_public_key(region: str, kid: str) -> str:
    return httpx.get(f"https://public-keys.auth.elb.{region}.amazonaws.com/{kid}").text


class ALBSecurityStore(BaseStore):
    ui = "AutoLoginForm"

    def __init__(self, cookie_name: str | None, signout_url: str | None, email_token_field: str, region: str, verify: bool = True):
        self.cookie_name = cookie_name
        self.signout_url = signout_url
        self.email_token_field = email_token_field
        self.verify = verify
        self.region = region

    def load_from_request(self, req: Request):
        # Get token data from header
        encoded_jwt = req.headers.get("X-Amzn-Oidc-Data", None)
        if encoded_jwt:
            try:
                if self.verify:
                    # Verify the ALB token as it is outlined here: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html#user-claims-encoding
                    # Get region from header, as we need the kid to get the public key
                    jwt_headers = encoded_jwt.split(".")[0]
                    decoded_jwt_headers = base64.b64decode(jwt_headers)
                    decoded_jwt_headers = decoded_jwt_headers.decode("utf-8")
                    decoded_json = json.loads(decoded_jwt_headers)
                    kid = decoded_json["kid"]
                    # Decode token using public key from AWS
                    user = jwt.decode(encoded_jwt, _get_public_key(region=self.region, kid=kid), algorithms=["ES256"])
                else:
                    # Decode token without verification
                    user = jwt.decode(encoded_jwt, options={"verify_signature": False})

                # Create new user from given attributes
                return User(
                    id=user[self.email_token_field],
                    roles=user.get("roles", []),
                    oauth2_access_token=req.headers["X-Amzn-Oidc-Accesstoken"],
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
            region=manager.settings.visyn_core.security.store.alb_security_store.region,
            verify=manager.settings.visyn_core.security.store.alb_security_store.verify,
        )

    return None
