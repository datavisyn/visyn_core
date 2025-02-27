import logging
import logging.config
from pathlib import Path

from celery import Celery

from ..plugin.parser import EntryPointPlugin


def init_celery_manager(*, plugins: list[EntryPointPlugin]):
    """
    Create a new Celery app and initialize it with the given plugins.
    """
    from .. import manager

    _log = logging.getLogger(__name__)

    if not manager.settings.visyn_core.celery:
        _log.warning("No Celery settings found in configuration, skipping Celery initialization")
        return None

    # Celery readiness checks are quite tricky, so we just create a file when the worker is ready and remove it when it shuts down.
    # https://github.com/celery/celery/issues/4079#issuecomment-1270085680
    if manager.settings.visyn_core.celery_readiness_file:
        from celery.signals import (
            worker_ready,
            worker_shutdown,
        )

        _log.info("Setting up Celery readiness file")
        readiness_file = Path(manager.settings.visyn_core.celery_readiness_file)

        @worker_ready.connect
        def readiness_on_worker_ready(**_):
            _log.info("Worker is ready")
            readiness_file.touch()

        @worker_shutdown.connect
        def readiness_on_worker_shutdown(**_):
            _log.info("Worker is shutting down")
            readiness_file.unlink(missing_ok=True)

    _log.info("Initializing celery app")
    manager.celery = Celery("visyn", result_extended=True, **manager.settings.visyn_core.celery)

    if manager.settings.visyn_core.celery_liveness_file:
        from celery import bootsteps

        _log.info("Setting up Celery liveness file")
        liveness_file = Path(manager.settings.visyn_core.celery_liveness_file)

        class LivenessProbe(bootsteps.StartStopStep):
            requires = ("celery.worker.components:Timer",)

            def __init__(self, worker, **kwargs):
                self.requests = []
                self.tref = None

            def start(self, worker):
                self.tref = worker.timer.call_repeatedly(
                    1.0,
                    self.update_heartbeat_file,
                    (worker,),
                    priority=10,
                )

            def stop(self, worker):
                liveness_file.unlink(missing_ok=True)

            def update_heartbeat_file(self, worker):
                liveness_file.touch()

        manager.celery.steps["worker"].add(LivenessProbe)

    # Discover tasks from all plugins, i.e. visyn_core.tasks, visyn_plugin.tasks
    manager.celery.autodiscover_tasks([p.id for p in plugins])

    return manager.celery


def create_celery_worker_app(*, workspace_config: dict | None = None):
    """
    Create a new Celery app in standalone mode, i.e. without a FastAPI instance.
    """
    from .. import manager
    from ..server.visyn_server import create_visyn_server

    # Create the whole FastAPI instance to ensure that the configuration and plugins are loaded, extension points are registered, database migrations are executed, ...
    create_visyn_server(workspace_config=workspace_config)

    _log = logging.getLogger(__name__)
    _log.info("Starting celery worker")

    return init_celery_manager(plugins=manager.registry.plugins)
