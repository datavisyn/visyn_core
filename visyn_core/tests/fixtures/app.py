from collections.abc import Generator
from typing import Any

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

from ...server.visyn_server import create_visyn_server
from ...settings import client_config


@pytest.fixture
def workspace_config() -> dict:
    return {
        "visyn_core": {
            "enabled_plugins": ["visyn_core"],
            "security": {
                "store": {
                    "no_security_store": {
                        "enable": True,
                    }
                }
            },
            "celery": {
                "broker": "memory://localhost/",
                "task_always_eager": True,
            },
        },
    }


@pytest.fixture
def app(workspace_config) -> FastAPI:
    # Only initialize the client config once
    if not client_config._has_been_initialized:
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


@pytest.fixture
def client(app: FastAPI) -> Generator[TestClient, Any, None]:
    with TestClient(app) as client:
        yield client
