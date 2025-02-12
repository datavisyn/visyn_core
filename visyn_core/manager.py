from typing import TYPE_CHECKING

# Neat trick to avoid circular imports when importing modules for type hints only:
# TYPE_CHECKING is set to True when the type-checker runs, and we can safely import our types here (as nothing is evaluted).
# Additionally, we have to wrap our types/classes in '', such that they are evaluated lazily.
# See https://peps.python.org/pep-0563/#runtime-annotation-resolution-and-type-checking for more information.
if TYPE_CHECKING:
    # Monkey-patch Celery to support proper type hints: https://pypi.org/project/celery-types/
    from celery.app.task import Task

    from .celery.app import Celery
    from .dbmanager import DBManager
    from .dbmigration.manager import DBMigrationManager
    from .id_mapping.manager import MappingManager
    from .plugin.registry import Registry
    from .security.manager import SecurityManager
    from .settings.model import GlobalSettings

    Task.__class_getitem__ = classmethod(lambda cls, *args, **kwargs: cls)  # type: ignore[attr-defined]


db: "DBManager" = None  # type: ignore
db_migration: "DBMigrationManager" = None  # type: ignore
id_mapping: "MappingManager" = None  # type: ignore
security: "SecurityManager" = None  # type: ignore
registry: "Registry" = None  # type: ignore
settings: "GlobalSettings" = None  # type: ignore
celery: "Celery" = None  # type: ignore
