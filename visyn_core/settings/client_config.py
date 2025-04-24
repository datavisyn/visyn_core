from inspect import isclass
from typing import Callable, Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field, create_model

from .. import manager

_has_been_initialized = False
_configs: list[type[BaseModel]] = []


def visyn_client_config(callback: Callable[[], type[BaseModel]] | type[BaseModel]):
    """
    Decorator to register a config model to be used in the client config endpoint.

    Example:
    ```python
    # Either directly annotate the model
    @visyn_client_config
    class MyAppConfig(BaseModel):
        my_config: str = "example_value"
        my_dynamic_value: bool = Field(default_factory=lambda: "my_role" in current_user().roles or manager.settings.env == 'development')

    # Or annotate a function that returns the model
    @visyn_client_config
    def _get_model():
        return MyAppConfig
    """
    if _has_been_initialized:
        raise Exception("Cannot use @visyn_client_config after initialization. Move it to the VisynPlugin#init_app.")
    if isclass(callback) and issubclass(callback, BaseModel):
        _configs.append(callback)
    elif callable(callback):
        _configs.append(callback())  # type: ignore
    else:
        raise Exception("Invalid callback type. Must be a BaseModel or a function that returns a BaseModel.")
    return callback


@visyn_client_config
class VisynCoreClientConfigModel(BaseModel):
    env: Literal["development", "production"] = Field(default_factory=lambda: manager.settings.env)
    e2e: bool = Field(default_factory=lambda: manager.settings.is_e2e_testing)
    sentry_dsn: str | None = Field(default_factory=lambda: manager.settings.visyn_core.sentry.get_frontend_dsn())
    sentry_proxy_to: str | None = Field(
        default_factory=lambda: "/api/sentry/" if manager.settings.visyn_core.sentry.get_frontend_proxy_to() else None
    )


def init_client_config(app: FastAPI):
    global _has_been_initialized
    global _configs
    _has_been_initialized = True

    # Dynamically create a model that contains all the registered client config models
    client_config_model = create_model("AppConfigModel", __base__=tuple(_configs))

    # Create an endpoint that returns the client config
    @app.get("/api/v1/visyn/clientConfig", tags=["Configuration"])
    async def _get_client_config() -> client_config_model:  # type: ignore
        return client_config_model(**(manager.settings.visyn_core.client_config or {}))
