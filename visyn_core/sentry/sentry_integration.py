import logging
from typing import TYPE_CHECKING

from fastapi import FastAPI
from starlette.types import ASGIApp

if TYPE_CHECKING:
    from ..settings.model import SentrySettings

_log = logging.getLogger(__name__)


def get_default_integrations():
    return [
        # Do not enable the AsyncioIntegration, as it breaks the user middleware, i.e. causing no user information to be set in the FastAPI transaction.
        # sentry_sdk.integrations.asyncio.AsyncioIntegration(),
    ]


# Use basic ASGI middleware instead of BaseHTTPMiddleware as it is significantly faster: https://github.com/tiangolo/fastapi/issues/2696#issuecomment-768224643
# Raw middlewares are actually quite complex: https://github.com/encode/starlette/blob/048643adc21e75b668567fc6bcdd3650b89044ea/starlette/middleware/errors.py#L147
class SentryUserMiddleware:
    def __init__(self, app: ASGIApp):
        self.app: ASGIApp = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        try:
            from .. import manager

            user = manager.security.current_user
            if user:
                import sentry_sdk

                sentry_sdk.set_user(
                    {
                        "id": user.id,
                        "username": user.name,
                    }
                )
        except Exception as e:
            _log.exception(f"Failed to set Sentry user: {e}")

        await self.app(scope, receive, send)


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

        # Create a merged settings dictionary to pass to the sentry_sdk.init function to avoid any duplicate keyword arguments
        merged_settings = {
            # Set sample_rate to 1.0 to sample 100% of transactions.
            "sample_rate": 1.0,
            # Set profiles_sample_rate to 1.0 to profile 100% of sampled transactions.
            "profiles_sample_rate": 1.0,
            # Set send_default_pii to True to send PII like the user's IP address.
            "send_default_pii": True,
            # Add some default integrations, but only if they are not set in the settings
            "integrations": get_default_integrations() if "integrations" not in settings.backend_init_options else [],
            # Add the custom options to the backend
            **settings.backend_init_options,
            # Set traces_sampler to ignore certain paths from being sampled
            "traces_sampler": traces_sampler,
            # Set the DSN last to make sure it is not overwritten
            "dsn": backend_dsn,
            # Set the release name and version last to make sure it is not overwritten
            "release": release,
        }

        sentry_sdk.init(**merged_settings)

        if sentry_sdk.scope.should_send_default_pii():
            # Add a before each request to call set_user on the sentry_sdk
            app.add_middleware(SentryUserMiddleware)
