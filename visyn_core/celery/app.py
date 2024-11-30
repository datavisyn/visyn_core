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

    manager.celery = Celery("visyn", **manager.settings.visyn_core.celery)

    _log.info("Initializing celery app")

    # Discover tasks from all plugins, i.e. visyn_core.tasks, visyn_plugin.tasks
    manager.celery.autodiscover_tasks([p.id for p in plugins])

    return manager.celery


def create_celery_worker_app(*, workspace_config: dict | None = None):
    """
    Create a new Celery app in standalone mode, i.e. without a FastAPI instance.
    """

    from ..settings.constants import default_logging_dict

    # Initialize the logging very early as otherwise the already created loggers receive a default loglevel WARN, leading to logs not being shown.
    logging.config.dictConfig(default_logging_dict)

    from ..server.utils import init_settings_manager

    # As we are in standalone mode, we need to initialize the settings manager ourselves (which otherwise happens in the create_visyn_server)
    # We don't initialize anything else (i.e. no registry, no endpoints, ...) as we don't need them in the worker.
    plugins = init_settings_manager(workspace_config=workspace_config)

    _log = logging.getLogger(__name__)
    _log.info("Starting celery worker")

    return init_celery_manager(plugins=plugins)
