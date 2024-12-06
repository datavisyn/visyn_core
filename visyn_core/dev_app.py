import pathlib
import sys

from .server.visyn_server import create_visyn_server

# This app is either started via the uvicorn runner in __main__.py,
# or as module to execute commands via `python -m <app>.dev_app db-migration exec ...`
app = create_visyn_server(start_cmd=" ".join(sys.argv[1:]), workspace_config={"_env_file": pathlib.Path(__file__).parent / ".env"})
