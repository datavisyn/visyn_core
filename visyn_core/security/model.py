from typing import Any

from pydantic import BaseModel

ANONYMOUS = "anonymous"


class Token(BaseModel):
    access_token: str
    token_type: str


class LogoutReturnValue(BaseModel):
    data: dict[Any, Any] | None = {}
    cookies: list[dict[Any, Any]] | None = []


class User(BaseModel):
    id: str
    roles: list[str] = []
    access_token: str | None = None
    """
    The access token is set when users login with the native JWT mechanism.
    """
    oauth2_access_token: str | None = None
    """
    OAuth2 access token as many security stores (like ALB or OAuth2) only parse an already existing access token from an IdP.
    This token can then be used for downstream tasks like requests to other services.
    """
    properties: dict[str, Any] = {}
    """
    Arbitary properties that are mapped to the user, i.e. from the JWT token to the user object.
    """

    @property
    def name(self):
        return self.id

    @property
    def is_anonymous(self):
        return self.name == ANONYMOUS

    def has_role(self, role):
        return role in self.roles


ANONYMOUS_USER = User(id=ANONYMOUS, roles=[])
