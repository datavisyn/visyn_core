import logging
import os
from unittest import mock

from starlette.testclient import TestClient

from visyn_core import manager
from visyn_core.server.visyn_server import create_visyn_server
from visyn_core.settings.model import GlobalSettings


def test_env_substitution():
    settings = GlobalSettings()

    assert settings.secret_key != "Custom_Secret_Key"
    assert settings.visyn_core.security.store.alb_security_store.enable != True  # NOQA: E712
    assert settings.visyn_core.security.store.alb_security_store.cookie_name is None
    assert settings.visyn_core.security.store.alb_security_store.email_token_field == ["email"]
    assert settings.visyn_core.security.store.oauth2_security_store.email_token_field == ["email"]
    assert settings.visyn_core.logging["version"] == 1
    assert settings.visyn_core.logging["root"]["level"] == "INFO"
    assert settings.visyn_core.client_config is None

    with mock.patch.dict(
        os.environ,
        {
            # Basic top-level key substitution
            "SECRET_KEY": "Custom_Secret_Key",
            # Deeply nested key substitution of properly typed model (includes automatic typecast)
            "VISYN_CORE__SECURITY__STORE__ALB_SECURITY_STORE__ENABLE": "True",
            # Deeply nested key substitution without automatic dict conversion
            "VISYN_CORE__SECURITY__STORE__ALB_SECURITY_STORE__COOKIE_NAME_AS_STRING": '{"my": "dict"}',
            # Deeply nested key substitution with automatic dict conversion
            "VISYN_CORE__SECURITY__STORE__ALB_SECURITY_STORE__EMAIL_TOKEN_FIELD": '["field1", "email"]',
            "VISYN_CORE__SECURITY__STORE__OAUTH2_SECURITY_STORE__EMAIL_TOKEN_FIELD": "field1",
            # Deeply nested key substitution of model typed via Dict (does not include automatic typecast)
            "VISYN_CORE__LOGGING__VERSION": "2",
            "VISYN_CORE__LOGGING__VERSION_AS_STRING_AS_STRING": "2",
            "VISYN_CORE__LOGGING__ROOT__LEVEL": "DEBUG",
            # Load dict types from JSON strings. Important: it must be a valid JSON, i.e. no \" escaping or so. Use single quotes to enclose the variable.
            "VISYN_CORE__CLIENT_CONFIG": '{"demo_from_function": true, "demo_from_class": true}',
        },
        clear=True,
    ):
        env_settings = GlobalSettings()

        assert env_settings.secret_key == "Custom_Secret_Key"
        assert env_settings.visyn_core.security.store.alb_security_store.enable == True  # NOQA: E712
        assert env_settings.visyn_core.security.store.alb_security_store.cookie_name == '{"my": "dict"}'
        assert env_settings.visyn_core.security.store.alb_security_store.email_token_field == ["field1", "email"]
        assert env_settings.visyn_core.security.store.oauth2_security_store.email_token_field == "field1"
        assert env_settings.visyn_core.logging["version"] == 2
        assert env_settings.visyn_core.logging["root"]["level"] == "DEBUG"
        assert env_settings.visyn_core.client_config == {"demo_from_function": True, "demo_from_class": True}

        assert env_settings.get_nested("secret_key") == "Custom_Secret_Key"
        assert env_settings.get_nested("visyn_core.security.store.alb_security_store.enable") == True  # NOQA: E712
        assert env_settings.get_nested("visyn_core.logging.version") == 2
        # Both variants as string are preserved, in case a real setting ends with the suffix
        assert env_settings.get_nested("visyn_core.logging.version_as_string") == "2"
        assert env_settings.get_nested("visyn_core.logging.version_as_string_as_string") == "2"
        assert env_settings.get_nested("visyn_core.logging.root.level") == "DEBUG"


def test_server_start():
    # By default, the logging level is INFO
    assert logging.getLogger().level == logging.INFO

    with mock.patch.dict(
        os.environ,
        {
            "visyn_core__log_level": "DEBUG",
        },
        clear=True,
    ):
        # Create a new server with the new settings
        create_visyn_server()

        # Assert the logging level is now DEBUG
        assert logging.getLogger().level == logging.DEBUG


def test_client_config(client: TestClient):
    # By default, we always return null for the clientConfig
    assert client.get("/api/v1/visyn/clientConfig").json() == {
        "e2e": False,
        "env": "production",
        "sentry_dsn": None,
        "sentry_proxy_to": None,
        "demo_from_function": False,
        "demo_from_class": False,
    }

    # Update the clientConfig in the settings
    manager.settings.visyn_core.client_config = {"demo_from_function": True, "demo_from_class": True}

    # Assert we receive exactly the client_config as result
    assert client.get("/api/v1/visyn/clientConfig").json() == {
        "e2e": False,
        "env": "production",
        "sentry_dsn": None,
        "sentry_proxy_to": None,
        "demo_from_function": True,
        "demo_from_class": True,
    }
