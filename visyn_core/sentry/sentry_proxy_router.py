import json
import logging
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, Request, Response

from .. import manager

sentry_router = APIRouter(prefix="/api/sentry", tags=["Sentry"])

_log = logging.getLogger(__name__)


@sentry_router.post("/")
async def proxy_sentry_envelope(request: Request):  # pyright: ignore[reportUnusedFunction]
    dsn = manager.settings.visyn_core.sentry.dsn
    if dsn:
        async with httpx.AsyncClient(timeout=10) as client:
            # Example to parse a sentry envelope: https://github.com/getsentry/examples/blob/66da5f8c9559f64f1bfa57f8dd9b0731f75cd0e9/tunneling/python/app.py
            envelope = await request.body()
            piece = envelope.split(b"\n")[0].decode("utf-8")
            header = json.loads(piece)
            dsn = urlparse(header.get("dsn"))
            proxy_to = manager.settings.visyn_core.sentry.proxy_to or f"{dsn.scheme}://{dsn.hostname}"
            project_id = dsn.path.strip("/")
            res = await client.post(
                url=f"{proxy_to}/api/{project_id}/envelope/",
                content=envelope,
                headers={"Content-Type": "application/x-sentry-envelope"},
            )
            return Response(status_code=res.status_code, content=res.content)
    else:
        return Response(status_code=500, content="Sentry is not configured")
