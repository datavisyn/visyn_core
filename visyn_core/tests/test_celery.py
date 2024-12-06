from fastapi.testclient import TestClient

from visyn_core import manager


def test_celery_worker(client: TestClient):

    @manager.celery.task
    def add(x, y):
        return x + y

    result = add.delay(2, 4)
    assert result.get(timeout=1) == 6
