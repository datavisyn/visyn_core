import jwt
import pytest
from fastapi.testclient import TestClient

from visyn_core import manager
from visyn_core.security.model import User
from visyn_core.security.store.alb_security_store import create as create_alb_security_store
from visyn_core.security.store.no_security_store import create as create_no_security_store
from visyn_core.security.store.oauth2_security_store import create as create_oauth2_security_store
from visyn_core.settings.model import OAuth2SecurityStoreHeader

AUTH_PARAMS = (
    "workspace_config",
    [
        {
            "visyn_core": {
                "enabled_plugins": ["visyn_core"],
            },
        }
    ],
)


@pytest.mark.parametrize(*AUTH_PARAMS)
def test_api_key(client: TestClient):
    assert client.get("/api/loggedinas", headers={"apiKey": "invalid_user:password"}).status_code == 401
    assert client.get("/api/loggedinas", headers={"apiKey": "admin:admin"}).json()["name"] == "admin"


@pytest.mark.parametrize(*AUTH_PARAMS)
def test_basic_authorization(client: TestClient):
    assert client.get("/api/loggedinas", auth=("invalid_user", "password")).status_code == 401
    assert client.get("/api/loggedinas", auth=("admin", "admin")).json()["name"] == "admin"


@pytest.mark.parametrize(*AUTH_PARAMS)
def test_paths_without_authentication(client: TestClient):
    # Test paths without authentication
    assert client.get("/api/health").status_code == 200
    assert client.get("/api/login").status_code == 200

    # Test path with authentication
    assert client.get("/api/loggedinas").status_code == 401
    assert client.get("/api/loggedinas", auth=("admin", "admin")).status_code == 200


@pytest.mark.parametrize(*AUTH_PARAMS)
def test_jwt_login(client: TestClient):
    # Add additional claims loaders
    @manager.security.jwt_claims_loader
    def claims_loader_1(user: User):
        return {"hello": "world"}

    @manager.security.jwt_claims_loader
    def claims_loader_2(user: User):
        return {"username": user.name}

    # Check if we are actually not logged in
    response = client.get("/api/loggedinas")
    assert response.status_code == 401

    # Login with the dummy user
    response = client.post("/api/login", data={"username": "admin", "password": "admin"})
    assert response.status_code == 200
    user: dict = response.json()
    assert user["name"] == "admin"
    assert user["roles"] == ["admin"]
    assert user["payload"]["hello"] == "world"
    assert user["payload"]["username"] == "admin"

    stores = client.get("/api/security/stores").json()
    assert stores == [{"id": "DummyStore", "ui": "DefaultLoginForm", "configuration": {}}]

    # Check if we are logged in and get the same response as from the login
    response = client.get("/api/loggedinas")
    assert response.status_code == 200
    assert user == response.json()
    assert (
        client.cookies.get(manager.settings.jwt_access_cookie_name) == user["access_token"]
    )  # Access token is equal in response and cookies

    # Now, we set the timeout to refresh artificially high to force a jwt refresh
    original_jwt_refresh_if_expiring_in_seconds = manager.settings.jwt_refresh_if_expiring_in_seconds
    manager.settings.jwt_refresh_if_expiring_in_seconds = manager.settings.jwt_expire_in_seconds + 5

    # Check if we are still logged in and get the same response as the refresh happens *after* the request
    assert user == client.get("/api/loggedinas").json()
    assert (
        client.cookies.get(manager.settings.jwt_access_cookie_name) != user["access_token"]
    )  # Access token is different in response and cookies

    # Restore the original jwt refresh timeout
    manager.settings.jwt_refresh_if_expiring_in_seconds = original_jwt_refresh_if_expiring_in_seconds

    # Check if we are logged in and get a different response as the cookie was auto-refreshed in the last request
    refreshed_user = client.get("/api/loggedinas").json()
    assert user["name"] == refreshed_user["name"]  # Same user
    assert user["access_token"] != refreshed_user["access_token"]  # But different token
    assert user["payload"]["exp"] < refreshed_user["payload"]["exp"]  # With longer expiry date
    assert (
        client.cookies.get(manager.settings.jwt_access_cookie_name) == refreshed_user["access_token"]
    )  # Access token is equal in new response and cookies

    # Logout
    response = client.post("/api/logout")
    assert response.status_code == 200

    # Check if we are actually not logged in anymore
    response = client.get("/api/loggedinas")
    assert response.status_code == 401


@pytest.mark.parametrize(*AUTH_PARAMS)
def test_jwt_token_location(client: TestClient):
    # Login to set a cookie
    response = client.post("/api/login", data={"username": "admin", "password": "admin"})
    assert response.status_code == 200
    access_token = response.json()["access_token"]

    # Disallow all methods
    manager.settings.jwt_token_location = []

    # Does not work even though both header and cookies are passed
    response = client.get("/api/loggedinas", headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 401

    # Allow headers
    manager.settings.jwt_token_location = ["headers"]

    # Does not work as only headers are accepted
    response = client.get("/api/loggedinas")
    assert response.status_code == 401

    # Does work as header is passed
    response = client.get("/api/loggedinas", headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 401

    # Allow cookies
    manager.settings.jwt_token_location = ["cookies"]

    # Does work even without header
    response = client.get("/api/loggedinas")
    assert response.json() != '"not_yet_logged_in"'


@pytest.mark.parametrize(*AUTH_PARAMS)
def test_alb_security_store(client: TestClient):
    # Add some basic configuration
    manager.settings.visyn_core.security.store.alb_security_store.enable = True
    manager.settings.visyn_core.security.store.alb_security_store.email_token_field = ["field1", "field2", "email"]
    manager.settings.visyn_core.security.store.alb_security_store.properties_fields = ["sub", "exp"]
    manager.settings.visyn_core.security.store.alb_security_store.decode_options = {"verify_signature": False}
    manager.settings.visyn_core.security.store.alb_security_store.cookie_name = "TestCookie"
    manager.settings.visyn_core.security.store.alb_security_store.signout_url = "http://localhost/api/logout"

    store = create_alb_security_store()
    assert store is not None

    manager.security.user_stores = [store]

    # Header created with a random token containing "email"
    headers = {
        "X-Amzn-Oidc-Identity": "",
        "X-Amzn-Oidc-Data": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdCIsInN1YiI6ImFkbWluIiwicm9sZXMiOlsiYWRtaW4iXSwiZXhwIjoxNjU3MTg4MTM4LjQ5NDU4Nn0.-Ye9j9z37gJdoKgrbeYbI8buSw_c6bLBShXt4XxwQHI",
        "X-Amzn-Oidc-Accesstoken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdCIsInN1YiI6ImFkbWluIiwicm9sZXMiOlsiYWRtaW4iXSwiZXhwIjoxNjU3MTg4MTM4LjQ5NDU4Nn0.-Ye9j9z37gJdoKgrbeYbI8buSw_c6bLBShXt4XxwQHI",
    }

    stores = client.get("/api/security/stores", headers=headers).json()
    assert stores == [{"id": "ALBSecurityStore", "ui": "AutoLoginForm", "configuration": {}}]

    # Check loggedinas with a JWT
    response = client.get("/api/loggedinas", headers=headers)
    assert response.status_code == 200
    assert response.json() != '"not_yet_logged_in"'
    assert response.json()["name"] == "admin@localhost"
    assert response.json()["properties"] == {"sub": "admin", "exp": 1657188138.494586}

    # Logout and check if we get the correct redirect url
    response = client.post("/api/logout", headers=headers)
    assert response.status_code == 200
    assert response.json()["redirect"] == "http://localhost/api/logout"

    # Test if we are not logged in if we use invalid fields
    store.email_token_fields = ["field1", "field2"]
    assert client.get("/api/loggedinas", headers=headers).status_code == 401


@pytest.mark.parametrize(*AUTH_PARAMS)
def test_oauth2_security_store(client: TestClient):
    # Add some basic configuration
    manager.settings.visyn_core.security.store.oauth2_security_store.enable = True
    manager.settings.visyn_core.security.store.oauth2_security_store.cookie_name = "TestCookie"
    manager.settings.visyn_core.security.store.oauth2_security_store.signout_url = "http://localhost/api/logout"
    manager.settings.visyn_core.security.store.oauth2_security_store.email_token_field = ["field1", "field2", "email"]
    manager.settings.visyn_core.security.store.oauth2_security_store.properties_fields = ["sub"]

    store = create_oauth2_security_store()
    assert store is not None

    manager.security.user_stores = [store]

    # Header created with a random token containing "email"
    headers = {
        "X-Forwarded-Access-Token": jwt.encode(
            {"email": "admin@localhost", "sub": "admin", "groups": ["role1", "role2"]}, "secret", algorithm="HS256"
        ),
    }

    stores = client.get("/api/security/stores", headers=headers).json()
    assert stores == [{"id": "OAuth2SecurityStore", "ui": "AutoLoginForm", "configuration": {}}]

    # Check loggedinas with a JWT
    response = client.get("/api/loggedinas", headers=headers)
    assert response.status_code == 200
    assert response.json() != '"not_yet_logged_in"'
    assert response.json()["name"] == "admin@localhost"
    assert response.json()["roles"] == ["role1", "role2"]
    assert response.json()["properties"] == {"sub": "admin"}

    # Logout and check if we get the correct redirect url
    response = client.post("/api/logout", headers=headers)
    assert response.status_code == 200
    assert response.json()["redirect"] == "http://localhost/api/logout"


@pytest.mark.parametrize(*AUTH_PARAMS)
def test_oauth2_security_store_multiple_headers(client: TestClient):
    # Add some basic configuration
    manager.settings.visyn_core.security.store.oauth2_security_store.enable = True
    manager.settings.visyn_core.security.store.oauth2_security_store.cookie_name = ["TestCookie"]
    manager.settings.visyn_core.security.store.oauth2_security_store.signout_url = "http://localhost/api/logout"
    manager.settings.visyn_core.security.store.oauth2_security_store.token_headers = [
        OAuth2SecurityStoreHeader(name="X-Forwarded-Access-Token", email_fields=["email"], properties_fields=["sub"]),
        OAuth2SecurityStoreHeader(name="X-Forwarded-Access-Token-2", email_fields=["email"], properties_fields=["sub"]),
        OAuth2SecurityStoreHeader(name="X-Forwarded-Access-Token-3", email_fields=["email"], properties_fields=["sub"]),
    ]

    store = create_oauth2_security_store()
    assert store is not None

    manager.security.user_stores = [store]

    # Check loggedinas with a JWT as last header
    response = client.get(
        "/api/loggedinas",
        headers={
            "X-Forwarded-Access-Token": "Invalid header",
            "X-Forwarded-Access-Token-3": jwt.encode({"email": "admin-3@localhost", "sub": "admin-3"}, "secret", algorithm="HS256"),
        },
    )
    assert response.status_code == 200
    assert response.json() != '"not_yet_logged_in"'
    assert response.json()["name"] == "admin-3@localhost"
    assert response.json()["properties"] == {"sub": "admin-3"}

    # Check loggedinas with a JWT with all headers, matching the first one
    response = client.get(
        "/api/loggedinas",
        headers={
            "X-Forwarded-Access-Token": jwt.encode({"email": "admin@localhost", "sub": "admin"}, "secret", algorithm="HS256"),
            "X-Forwarded-Access-Token-2": jwt.encode({"email": "admin-2@localhost", "sub": "admin-2"}, "secret", algorithm="HS256"),
            "X-Forwarded-Access-Token-3": jwt.encode({"email": "admin-3@localhost", "sub": "admin-3"}, "secret", algorithm="HS256"),
        },
    )
    assert response.status_code == 200
    assert response.json() != '"not_yet_logged_in"'
    assert response.json()["name"] == "admin@localhost"
    assert response.json()["properties"] == {"sub": "admin"}


@pytest.mark.parametrize(*AUTH_PARAMS)
def test_no_security_store(client: TestClient):
    # Add some basic configuration
    manager.settings.visyn_core.security.store.no_security_store.enable = True
    manager.settings.visyn_core.security.store.no_security_store.user = "test_name"
    manager.settings.visyn_core.security.store.no_security_store.roles = ["test_role"]
    manager.settings.visyn_core.security.store.no_security_store.properties = {"id": 123, "name": "test"}

    store = create_no_security_store()
    assert store is not None

    manager.security.user_stores = [store]

    user_info = client.get("/api/loggedinas").json()
    assert user_info != '"not_yet_logged_in"'
    assert user_info["name"] == "test_name"
    assert user_info["roles"] == ["test_role"]
    assert user_info["properties"] == {"id": 123, "name": "test"}


@pytest.mark.parametrize(*AUTH_PARAMS)
def test_user_login_hooks(client: TestClient):
    counter = 0

    @manager.security.on_user_loaded
    def on_user_loaded_increment(user: User):
        nonlocal counter
        counter += 1

    assert counter == 0

    client.get("/api/loggedinas", auth=("admin", "admin"))

    assert counter == 1

    @manager.security.on_user_loaded
    def on_user_loaded_decrement(user: User):
        nonlocal counter
        counter -= 1

    client.get("/api/loggedinas", auth=("admin", "admin"))

    assert counter == 1
