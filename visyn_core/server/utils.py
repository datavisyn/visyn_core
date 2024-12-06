import http
import logging
import logging.config
import time
import traceback

from fastapi import HTTPException
from pydantic import create_model
from pydantic.utils import deep_update

from .. import manager

# Flask is using exceptions from Werkzeug, which are not compatible with FastAPI's HTTPException
# Only import and use FlaskHTTPException if Flask is available
try:
    from werkzeug.exceptions import HTTPException as FlaskHTTPException  # type: ignore
except ImportError:
    FlaskHTTPException = None

_log = logging.getLogger(__name__)


def init_settings_manager(workspace_config: dict | None = None):
    from ..settings.model import GlobalSettings
    from ..settings.utils import load_workspace_config

    # Load the workspace config.json and initialize the global settings
    workspace_config = workspace_config if isinstance(workspace_config, dict) else load_workspace_config()
    # Temporary backwards compatibility: if no visyn_core config entry is found, copy the one from tdp_core.
    if "visyn_core" not in workspace_config and "tdp_core" in workspace_config:
        logging.warn('You are still using "tdp_core" config entries instead of "visyn_core" entries. Please migrate as soon as possible!')
        workspace_config["visyn_core"] = workspace_config["tdp_core"]

    manager.settings = GlobalSettings(**workspace_config)

    # Initialize the logging
    logging_config = manager.settings.visyn_core.logging

    if manager.settings.visyn_core.log_level:
        try:
            logging_config["root"]["level"] = manager.settings.visyn_core.log_level
        except KeyError:
            logging.warn("You have set visyn_core.log_level, but no root logger is defined in visyn_core.logging")

    logging.config.dictConfig(logging_config)

    # Load the initial plugins
    from ..plugin.parser import get_config_from_plugins, load_all_plugins

    plugins = load_all_plugins()

    # With all the plugins, load the corresponding configuration files and create a new model based on the global settings, with all plugin models as sub-models
    [plugin_config_files, plugin_settings_models] = get_config_from_plugins(plugins)
    visyn_server_settings = create_model("VisynServerSettings", __base__=GlobalSettings, **plugin_settings_models)  # type: ignore
    # Patch the global settings by instantiating the new settings model with the global config, all config.json(s), and pydantic models
    manager.settings: GlobalSettings = visyn_server_settings(**deep_update(*plugin_config_files, workspace_config))  # type: ignore

    return plugins


init_legacy_app = None
try:
    # Flask is an optional dependency and must be added to the requirements for legacy apps.
    from flask import Flask, jsonify  # type: ignore

    def _init_legacy_app(app: Flask):
        """
        initializes an application by setting common properties and options
        :param app:
        :param is_default_app:
        :return:
        """
        if hasattr(app, "got_first_request") and app.got_first_request:
            return

        if hasattr(app, "debug"):
            # TODO: Evaluate if this should be set to manager.settings.is_development_mode
            app.debug = False

        if manager.settings.visyn_core:
            app.config["SECRET_KEY"] = manager.settings.secret_key

        @app.errorhandler(FlaskHTTPException)
        @app.errorhandler(Exception)  # type: ignore
        async def handle_exception(e):
            """Handles Flask exceptions by returning the same JSON response as FastAPI#HTTPException would."""
            _log.exception(repr(e))
            # Extract status information if a Flask#HTTPException is given, otherwise return 500 with exception information
            status_code = e.code if FlaskHTTPException and isinstance(e, FlaskHTTPException) else 500
            detail = detail_from_exception(e)
            # Exact same response as the one from FastAPI#HTTPException.
            return jsonify({"detail": detail or http.HTTPStatus(status_code).phrase}), status_code

        return app

    init_legacy_app = _init_legacy_app
except ImportError:
    pass


def load_after_server_started_hooks():
    """
    Load and run all `after_server_started` extension points.
    The factory method of an extension implementing this extension point should return a function which is then executed here
    """
    from .. import manager

    _log = logging.getLogger(__name__)

    start = time.time()

    after_server_started_hooks = [p.load().factory() for p in manager.registry.list("after_server_started")]

    if after_server_started_hooks:
        _log.info(f"Found {len(after_server_started_hooks)} after_server_started extension(s) to run")

        for hook in after_server_started_hooks:
            hook()

        _log.info("Elapsed time for server startup hooks: %d seconds", time.time() - start)


def detail_from_exception(e: Exception) -> str | None:
    """Returns the full stacktrace in development mode and just the error message in production mode."""
    # Always return full stacktrace in development mode
    if manager.settings.is_development_mode:
        return "THIS STACKTRACE IS SHOWN IN DEVELOPMENT MODE ONLY. IN PRODUCTION, ONLY THE SPECIFIC ERROR MESSAGE IS SHOWN!" + "".join(
            traceback.format_exception(None, e, e.__traceback__)
        )
    # Exception specific returns
    if isinstance(e, HTTPException):
        return e.detail
    if FlaskHTTPException and isinstance(e, FlaskHTTPException):
        return e.description  # type: ignore
    # Fallback to the string representation of the exception
    return repr(e)
