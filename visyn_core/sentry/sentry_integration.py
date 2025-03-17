import logging
from typing import TYPE_CHECKING

from fastapi import FastAPI, Request

if TYPE_CHECKING:
    from ..settings.model import SentrySettings

_log = logging.getLogger(__name__)


def get_default_integrations():
    import sentry_sdk.integrations.asyncio
    import sentry_sdk.integrations.fastapi
    import sentry_sdk.integrations.starlette

    return [
        sentry_sdk.integrations.asyncio.AsyncioIntegration(),
        sentry_sdk.integrations.starlette.StarletteIntegration(middleware_spans=False),
        sentry_sdk.integrations.fastapi.FastApiIntegration(middleware_spans=False),
    ]


def init_sentry_integration(*, app: FastAPI, settings: "SentrySettings", verbose_paths: tuple, release: str):
    frontend_dsn = settings.get_frontend_dsn()
    frontend_proxy_to = settings.get_frontend_proxy_to()
    if frontend_dsn:
        _log.info(
            f"Initializing Sentry frontend with DSN {frontend_dsn}" + (f" and proxying to {frontend_proxy_to}" if frontend_proxy_to else "")
        )

        from .sentry_proxy_router import sentry_router

        app.include_router(sentry_router)

    backend_dsn = settings.get_backend_dsn()
    if backend_dsn:
        import sentry_sdk
        import sentry_sdk.scope

        # The sentry DSN usually contains the "public" URL of the sentry server, i.e. https://sentry.app-internal.datavisyn.io/...
        # which is sometimes not accessible due to authentication. Therefore, we allow to proxy the sentry requests to a different URL,
        # i.e. a cluster internal one without authentication. The same is happening for the frontend with the Sentry proxy router.
        proxy_to = settings.get_backend_proxy_to()

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
            release=release,
            sample_rate=1.0,
            # Set traces_sampler to ignore certain paths from being sampled
            traces_sampler=traces_sampler,
            # Set profiles_sample_rate to 1.0 to profile 100% of sampled transactions.
            profiles_sample_rate=1.0,
            # Set send_default_pii to True to send PII like the user's IP address.
            send_default_pii=True,
            # Add some default integrations
            integrations=get_default_integrations() if "integrations" not in settings.backend_init_options else [],
            # Add custom options to the backend
            **settings.backend_init_options,
            # Finally set the DSN
            dsn=backend_dsn,
        )

        # Add a before each request to call set_user on the sentry_sdk
        @app.middleware("http")
        async def sentry_add_user_middleware(request: Request, call_next):
            from .. import manager

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
