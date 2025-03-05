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

    from fastapi import Depends, FastAPI, Request

    from ..security.dependencies import get_current_user

    # Protect all routes, except for a few without authentication ones like /api/login
    def protect_all_routes(request: Request):
        all_paths_without_authentication_from_plugins = tuple(
            path for p in manager.registry.plugins for path in p.plugin.paths_without_authentication()
        )
        if request.url.path in all_paths_without_authentication_from_plugins:
            return None
        return get_current_user(request)

    app = FastAPI(
        debug=manager.settings.is_development_mode,
        title="Visyn Server",
        # TODO: Extract version from package.json
        version="1.0.0",
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
        redoc_url="/api/redoc",
        dependencies=[Depends(protect_all_routes)],
        **fast_api_args,
    )

    # Filter out the verbose paths from the access log
    verbose_paths = (
        "/api/sentry/",
        "/api/loggedinas",
        "/api/health",
        "/api/metrics",
        "/health",
        "/metrics",
    )
    ignored_paths_for_logging_filter = tuple(f'{path} HTTP/1.1" 200' for path in verbose_paths)

    # Filter out the metrics endpoint from the access log
    class EndpointFilter(logging.Filter):
        def filter(self, record: logging.LogRecord) -> bool:
            return not any(endpoint in record.getMessage() for endpoint in ignored_paths_for_logging_filter)

    logging.getLogger("uvicorn.access").addFilter(EndpointFilter())

    from ..middleware.exception_handler_middleware import ExceptionHandlerMiddleware

    # TODO: For some reason, a @app.exception_handler(Exception) is not called here. We use a middleware instead.
    app.add_middleware(ExceptionHandlerMiddleware)

    # Store all globals also in app.state.<manager> to allow access in FastAPI routes via request.app.state.<manager>.
    app.state.settings = manager.settings

    if manager.settings.visyn_core.telemetry and manager.settings.visyn_core.telemetry.enabled:
        from ..telemetry import init_telemetry

        init_telemetry(app, settings=manager.settings.visyn_core.telemetry)

    frontend_dsn = manager.settings.visyn_core.sentry.get_frontend_dsn()
    frontend_proxy_to = manager.settings.visyn_core.sentry.get_frontend_proxy_to()
    if frontend_dsn:
        _log.info(
            f"Initializing Sentry frontend with DSN {frontend_dsn}" + (f" and proxying to {frontend_proxy_to}" if frontend_proxy_to else "")
        )

    backend_dsn = manager.settings.visyn_core.sentry.get_backend_dsn()
    if backend_dsn:
        import sentry_sdk
        import sentry_sdk.integrations.asyncio
        import sentry_sdk.integrations.fastapi
        import sentry_sdk.integrations.starlette
        import sentry_sdk.scope

        # The sentry DSN usually contains the "public" URL of the sentry server, i.e. https://sentry.app-internal.datavisyn.io/...
        # which is sometimes not accessible due to authentication. Therefore, we allow to proxy the sentry requests to a different URL,
        # i.e. a cluster internal one without authentication. The same is happening for the frontend with the Sentry proxy router.
        proxy_to = manager.settings.visyn_core.sentry.get_backend_proxy_to()

        _log.info(f"Initializing Sentry backend with DSN {backend_dsn}" + (f" and proxying to {proxy_to}" if proxy_to else ""))
        if proxy_to:
            from urllib.parse import urlparse

            parsed_dsn = urlparse(backend_dsn)
            parsed_tunnel = urlparse(proxy_to)

            # Replace the scheme and hostname of the dsn with the proxy_to URL, while keeping the rest intact.
            # I.e. <scheme>://<token>@<url>/<project> becomes <scheme of proxy_to>://<token>:<url of proxy_to>/<project>
            backend_dsn = backend_dsn.replace(parsed_dsn.scheme, parsed_tunnel.scheme)
            if parsed_dsn.hostname and parsed_tunnel.hostname:
                backend_dsn = backend_dsn.replace(parsed_dsn.hostname, parsed_tunnel.hostname)

        def traces_sampler(sampling_context):
            # Ignore certain paths from being sampled as they only pollute the traces
            if sampling_context and sampling_context.get("transaction_context", {}).get("op") == "http.server":
                path = sampling_context.get("asgi_scope", {}).get("path")
                if path and path in verbose_paths:
                    return 0
            # By default, sample all transactions
            return 1

        sentry_sdk.init(
            sample_rate=1.0,
            # Set traces_sampler to ignore certain paths from being sampled
            traces_sampler=traces_sampler,
            # Set profiles_sample_rate to 1.0 to profile 100% of sampled transactions.
            profiles_sample_rate=1.0,
            # Set send_default_pii to True to send PII like the user's IP address.
            send_default_pii=True,
            # Set integrations to enable integrations for asyncio, starlette and fastapi
            integrations=[
                sentry_sdk.integrations.asyncio.AsyncioIntegration(),
                sentry_sdk.integrations.starlette.StarletteIntegration(middleware_spans=False),
                sentry_sdk.integrations.fastapi.FastApiIntegration(middleware_spans=False),
            ],
            # Add custom options to the backend
            **manager.settings.visyn_core.sentry.backend_init_options,
            # Finally set the DSN
            dsn=backend_dsn,
        )

        # Add a before each request to call set_user on the sentry_sdk
        @app.middleware("http")
        async def sentry_add_user_middleware(request: Request, call_next):
            if sentry_sdk.is_initialized() and sentry_sdk.scope.should_send_default_pii():
                user = manager.security.current_user
                if user:
                    sentry_sdk.set_user(
                        {
                            "id": user.id,
                            "username": user.name,
                        }
                    )
            return await call_next(request)

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
