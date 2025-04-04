import logging
import logging.config

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

    manager.celery = Celery("visyn", result_extended=True, **manager.settings.visyn_core.celery)

    _log.info("Initializing celery app")

    # Discover tasks from all plugins, i.e. visyn_core.tasks, visyn_plugin.tasks
    manager.celery.autodiscover_tasks([p.id for p in plugins])

    return manager.celery


def create_celery_worker_app(*, main_app: str | None = None, workspace_config: dict | None = None):
    """
    Create a new Celery app in standalone mode, i.e. without a FastAPI instance.
    """
    from .. import manager
    from ..server.visyn_server import create_visyn_server

    # Create the whole FastAPI instance to ensure that the configuration and plugins are loaded, extension points are registered, database migrations are executed, ...
    create_visyn_server(main_app=main_app, workspace_config=workspace_config)

    _log = logging.getLogger(__name__)
    _log.info("Starting celery worker")

    return init_celery_manager(plugins=manager.registry.plugins)
