import json
import logging
import ssl
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, Request, Response

from .. import manager

sentry_router = APIRouter(prefix="/api/sentry", tags=["Sentry"])

_log = logging.getLogger(__name__)


@sentry_router.post("/")
async def proxy_sentry_envelope(request: Request):  # pyright: ignore[reportUnusedFunction]
    dsn = manager.settings.visyn_core.sentry.get_frontend_dsn()
    if dsn:
        ca_certs = manager.settings.visyn_core.sentry.backend_init_options.get("ca_certs")
        ssl_context = ssl.create_default_context(cafile=ca_certs) if ca_certs else manager.settings.visyn_core.sentry.frontend_proxy_verify
        async with httpx.AsyncClient(timeout=manager.settings.visyn_core.sentry.frontend_proxy_timeout, verify=ssl_context) as client:
            # Example to parse a sentry envelope: https://github.com/getsentry/examples/blob/66da5f8c9559f64f1bfa57f8dd9b0731f75cd0e9/tunneling/python/app.py
            envelope = await request.body()
            piece = envelope.split(b"\n")[0].decode("utf-8")
            header = json.loads(piece)
            dsn = urlparse(header.get("dsn"))
            proxy_to = manager.settings.visyn_core.sentry.get_frontend_proxy_to() or f"{dsn.scheme}://{dsn.hostname}"
            project_id = dsn.path.strip("/")
            res = await client.post(
                url=f"{proxy_to}/api/{project_id}/envelope/",
                content=envelope,
                headers={"Content-Type": "application/x-sentry-envelope"},
            )

            # Only proxy the headers we care about
            headers = {k: res.headers.get(k) for k in ["Content-Type", "X-Sentry-Error"] if res.headers.get(k)}
            return Response(
                status_code=res.status_code,
                content=res.content,
                headers=headers,
            )
    else:
        return Response(status_code=500, content="Sentry is not configured")
