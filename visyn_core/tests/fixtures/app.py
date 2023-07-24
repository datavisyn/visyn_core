from collections.abc import Generator
from typing import Any

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

from ...security import permissions
from ...security.manager import SecurityManager
from ...server.visyn_server import create_visyn_server
from ...settings import client_config


@pytest.fixture()
def _mock_plugins(monkeypatch):
    def mock_current_user_in_manager(self):
        return permissions.User(id="admin")

    monkeypatch.setattr(SecurityManager, "current_user", property(mock_current_user_in_manager))


@pytest.fixture()
def workspace_config() -> dict:
    return {
        "visyn_core": {"enabled_plugins": ["visyn_core"]},
    }


@pytest.fixture()
def app(workspace_config) -> FastAPI:
    # Reset the client config globals
    client_config._has_been_initialized = False
    client_config._configs = []

    # Example client config used in tests
    @client_config.visyn_client_config
    def _get_model():
        class MyFunctionAppConfigModel(BaseModel):
            demo_from_function: bool = False

        return MyFunctionAppConfigModel

    @client_config.visyn_client_config
    class MyClassAppConfigModel(BaseModel):
        demo_from_class: bool = False

    return create_visyn_server(workspace_config=workspace_config)


@pytest.fixture()
def client(app: FastAPI) -> Generator[TestClient, Any, None]:
    with TestClient(app) as client:
        yield client
