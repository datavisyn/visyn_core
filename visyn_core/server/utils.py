import http
import logging
import time
import traceback

from fastapi import HTTPException

from .. import manager

# Flask is using exceptions from Werkzeug, which are not compatible with FastAPI's HTTPException
# Only import and use FlaskHTTPException if Flask is available
try:
    from werkzeug.exceptions import HTTPException as FlaskHTTPException  # type: ignore
except ImportError:
    FlaskHTTPException = None

_log = logging.getLogger(__name__)


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
