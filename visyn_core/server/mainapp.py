import logging
import os

from fastapi import APIRouter

_log = logging.getLogger(__name__)

mainapp_router = APIRouter(tags=["MainApp"])


@mainapp_router.get("/buildInfo.json")
def build_info():
    from codecs import open

    from .. import manager

    dependencies = []
    all_plugins = []
    build_info = {"plugins": all_plugins, "dependencies": dependencies}

    requirements = "requirements.txt"
    if os.path.exists(requirements):
        with open(requirements, "r", encoding="utf-8") as f:
            dependencies.extend([line.strip() for line in f.readlines()])

    for p in manager.registry.plugins:
        if p.id == "visyn_core":
            build_info["name"] = p.name  # type: ignore
            build_info["version"] = p.version  # type: ignore
            build_info["resolved"] = p.resolved  # type: ignore
        else:
            desc = {"name": p.name, "version": p.version, "resolved": p.resolved}
            all_plugins.append(desc)

    return build_info


# health check for docker-compose, kubernetes
@mainapp_router.head("/api/health")
@mainapp_router.get("/api/health")
async def health():
    return "ok"


# TODO: Remove this endpoint after everyone switched to it.
@mainapp_router.head("/health")
@mainapp_router.get("/health")
async def deprecated_health():
    _log.warn("Using deprecated /health endpoint. Consider switching to /api/health.")
    return "ok"
