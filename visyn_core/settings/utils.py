import codecs
import logging
import os
from typing import Any

import jsoncfg

_log = logging.getLogger(__name__)


def load_workspace_config() -> dict[str, Any]:
    """
    Loads the global config.json placed at `PHOVEA_CONFIG_PATH` (defaults to `config.json`).
    """
    global_ = os.path.abspath(os.environ.get("PHOVEA_CONFIG_PATH", "/phovea/config.json"))

    if os.path.exists(global_):
        _log.info(f"Loading workspace config.json from {global_}")
        return load_config_file(global_)
    else:
        _log.info(f"No {global_} found, using empty dict")
        return {}


def load_config_file(path: str) -> dict[str, Any]:
    """
    Opens any `*.json` file and loads it via `jsoncfg.loads`.
    """
    with codecs.open(path, "r", "utf-8") as fi:
        return jsoncfg.loads(fi.read()) or {}


def get_default_postgres_url(
    *,
    driver: str = "postgresql",
    user: str = "admin",
    password: str = "admin",
    host: str | None = os.getenv("POSTGRES_HOSTNAME"),
    host_fallback: str = "localhost",
    port: int | str | None = os.getenv("POSTGRES_PORT"),
    port_fallback: int | str = 5432,
    database: str = "db",
) -> str:
    """
    Returns a default postgres url, including the default values for `driver`, `user`, `password`, `host`, `port` and `database`.
    """
    return f"{driver}://{user}:{password}@{host or host_fallback}:{port or port_fallback}/{database}"
