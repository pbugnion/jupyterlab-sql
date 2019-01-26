
import json
from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler


class SqlHandler(IPythonHandler):
    def get(self):
        self.log.info("received request")
        self.finish(json.dumps({"result": "hello world"}))


def register_handlers(nbapp):
    web_app = nbapp.web_app
    host_pattern = ".*$"
    route_pattern = url_path_join(
        web_app.settings["base_url"],
        "/jupyterlab_sql"
    )
    handlers = [(route_pattern, SqlHandler)]
    web_app.add_handlers(host_pattern, handlers)
