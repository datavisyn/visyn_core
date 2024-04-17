import os

from fastapi import APIRouter

mainapp_router = APIRouter(prefix="/api", tags=["MainApp"])


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
@mainapp_router.api_route("/health", methods=["GET", "HEAD"])
async def health():
    return "ok"
