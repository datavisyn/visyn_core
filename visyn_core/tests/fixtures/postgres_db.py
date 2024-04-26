from collections.abc import Generator

import pytest
from pytest_postgresql.executor import PostgreSQLExecutor
from pytest_postgresql.factories import postgresql_proc
from pytest_postgresql.janitor import DatabaseJanitor

assert postgresql_proc


class PostgreSQLExecutorWithUrl(PostgreSQLExecutor):
    url: str


@pytest.fixture(scope="session")
def postgres_db(postgresql_proc) -> Generator[PostgreSQLExecutorWithUrl, None, None]:
    d = postgresql_proc
    d.url = f"postgresql://{d.user}:{d.password}@{d.host}:{d.port}/{d.dbname}"
    janitor = DatabaseJanitor(user=d.user, host=d.host, port=d.port, dbname=d.dbname, version=d.version, password=d.password)
    janitor.init()  # import this ONCE in your conftest.py, not in each test module
    yield d
    janitor.drop()
