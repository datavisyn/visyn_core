import logging
import logging.config
import sys
import threading
from typing import Any

from ..settings.constants import default_logging_dict

# Initialize the logging very early as otherwise the already created loggers receive a default loglevel WARN, leading to logs not being shown.
logging.config.dictConfig(default_logging_dict)


def create_visyn_server(*, fast_api_args: dict[str, Any] | None = None, start_cmd: str | None = None, workspace_config: dict | None = None):
    """
    Create a new FastAPI instance while ensuring that the configuration and plugins are loaded, extension points are registered, database migrations are executed, ...

    Keyword arguments:
    fast_api_args: Optional dictionary of arguments directly passed to the FastAPI constructor.
    start_cmd: Optional start command for the server, i.e. db-migration exposes commands like `db-migration exec <..> upgrade head`.
    workspace_config: Optional override for the workspace configuration. If nothing is provided `load_workspace_config()` is used instead.
    """
    if fast_api_args is None:
        fast_api_args = {}
    from .. import manager
    from .utils import init_settings_manager

    plugins = init_settings_manager(workspace_config=workspace_config)

    _log = logging.getLogger(__name__)
    _log.info(f"Starting in {manager.settings.env} mode")

    from fastapi import FastAPI

    app = FastAPI(
        debug=manager.settings.is_development_mode,
        title="Visyn Server",
        # TODO: Extract version from package.json
        version="1.0.0",
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
        redoc_url="/api/redoc",
        **fast_api_args,
    )

    # Filter out the metrics endpoint from the access log
    class EndpointFilter(logging.Filter):
        def filter(self, record: logging.LogRecord) -> bool:
            return "GET /api/metrics" and "GET /api/health" and "GET /metrics" and "GET /health" not in record.getMessage()

    logging.getLogger("uvicorn.access").addFilter(EndpointFilter())

    from ..middleware.exception_handler_middleware import ExceptionHandlerMiddleware

    # TODO: For some reason, a @app.exception_handler(Exception) is not called here. We use a middleware instead.
    app.add_middleware(ExceptionHandlerMiddleware)

    # Store all globals also in app.state.<manager> to allow access in FastAPI routes via request.app.state.<manager>.
    app.state.settings = manager.settings

    if manager.settings.visyn_core.telemetry and manager.settings.visyn_core.telemetry.enabled:
        from ..telemetry import init_telemetry

        init_telemetry(app, settings=manager.settings.visyn_core.telemetry)

    if manager.settings.visyn_core.sentry.dsn:
        import sentry_sdk

        sentry_sdk.init(
            dsn=manager.settings.visyn_core.sentry.dsn,
            # Set traces_sample_rate to 1.0 to capture 100%
            # of transactions for tracing.
            traces_sample_rate=1.0,
            # Set profiles_sample_rate to 1.0 to profile 100%
            # of sampled transactions.
            # We recommend adjusting this value in production.
            profiles_sample_rate=1.0,
            **manager.settings.visyn_core.sentry.server_init_options,
        )

    # Initialize global managers.
    from ..celery.app import init_celery_manager

    app.state.celery = init_celery_manager(plugins=plugins)

    from ..plugin.registry import Registry

    app.state.registry = manager.registry = Registry()
    manager.registry.init_app(app, plugins)

    from ..dbmanager import DBManager

    app.state.db = manager.db = DBManager()
    manager.db.init_app(app)

    from ..dbmigration.manager import DBMigrationManager

    app.state.db_migration = manager.db_migration = DBMigrationManager()
    manager.db_migration.init_app(app, manager.registry.list("tdp-sql-database-migration"))  # type: ignore

    from ..security.manager import create_security_manager

    app.state.security = manager.security = create_security_manager()
    manager.security.init_app(app)

    from ..id_mapping.manager import create_id_mapping_manager

    app.state.id_mapping = manager.id_mapping = create_id_mapping_manager()

    # TODO: Allow custom command routine (i.e. for db-migrations)
    from .cmd import parse_command_string

    alternative_start_command = parse_command_string(start_cmd)
    if alternative_start_command:
        _log.info(f"Received start command: {start_cmd}")
        alternative_start_command()
        _log.info("Successfully executed command, exiting server...")
        # TODO: How to properly exit here? Should a command support the "continuation" of the server, i.e. by returning True?
        sys.exit(0)

    # Load all namespace plugins as WSGIMiddleware plugins
    from fastapi.middleware.wsgi import WSGIMiddleware

    from .utils import init_legacy_app, load_after_server_started_hooks

    namespace_plugins = manager.registry.list("namespace")
    _log.info(f"Registering {len(namespace_plugins)} legacy namespace(s) via WSGIMiddleware")
    for p in namespace_plugins:
        namespace = p.namespace  # type: ignore
        sub_app = p.load().factory()
        init_legacy_app(sub_app)
        app.mount(namespace, WSGIMiddleware(sub_app))

    # Load all FastAPI apis
    router_plugins = manager.registry.list("fastapi_router")
    _log.info(f"Registering {len(router_plugins)} FastAPI router(s)")
    # Load all namespace plugins as WSGIMiddleware plugins
    for p in router_plugins:
        app.include_router(p.load().factory())

    from .mainapp import mainapp_router

    app.include_router(mainapp_router)

    @app.on_event("startup")
    async def change_anyio_total_tokens():
        # FastAPI uses anyio threads to handle sync endpoint concurrently.
        # This is a workaround to increase the number of threads to 100, as the default is only 40.
        try:
            from anyio import to_thread

            limiter = to_thread.current_default_thread_limiter()
            limiter.total_tokens = manager.settings.visyn_core.total_anyio_tokens
        except Exception as e:
            _log.exception(
                f"Could not set the total number of anyio tokens to {manager.settings.visyn_core.total_anyio_tokens}. Error: {e}"
            )

    if manager.settings.visyn_core.cypress:
        _log.info("Cypress mode is enabled. This should only be used in a Cypress testing environment or CI.")

    # As a last step, call init_app callback for every plugin. This is last to ensure everything we need is already initialized.
    for p in plugins:
        p.plugin.init_app(app)

    # Load `after_server_started` extension points which are run immediately after server started,
    # so all plugins should have been loaded at this point of time
    # the hooks are run in a separate (single) thread to not block the main execution of the server
    # TODO: Use FastAPI mechanism for that
    t = threading.Thread(target=load_after_server_started_hooks)
    t.daemon = True
    t.start()

    from ..settings.client_config import init_client_config

    init_client_config(app)

    from starlette_context.middleware import RawContextMiddleware

    from ..middleware.request_context_plugin import RequestContextPlugin

    # Use starlette-context to store the current request globally, i.e. accessible via context['request']
    app.add_middleware(RawContextMiddleware, plugins=(RequestContextPlugin(),))

    return app
