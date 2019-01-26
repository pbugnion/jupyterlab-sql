
import json
from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler

from sqlalchemy import create_engine


class SqlHandler(IPythonHandler):
    def __init__(self, *args, **kwargs):
        self.engine = create_engine("postgres://localhost:5432/postgres")
        super(SqlHandler, self).__init__(*args, **kwargs)

    def get(self):
        connection = self.engine.connect()
        result = connection.execute("SELECT * FROM t")
        keys = result.keys()
        rows = [tuple(row) for row in result]
        response = {
            "keys": keys,
            "rows": rows
        }
        self.finish(json.dumps({"result": response}))


def register_handlers(nbapp):
    web_app = nbapp.web_app
    host_pattern = ".*$"
    route_pattern = url_path_join(
        web_app.settings["base_url"],
        "/jupyterlab_sql"
    )
    handlers = [(route_pattern, SqlHandler)]
    web_app.add_handlers(host_pattern, handlers)
