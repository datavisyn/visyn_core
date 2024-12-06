import pathlib

from .celery.app import create_celery_worker_app

celery_app = create_celery_worker_app(workspace_config={"_env_file": pathlib.Path(__file__).parent / ".env"})
