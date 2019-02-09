
import json
from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
from tornado.escape import json_decode
import tornado.ioloop

from sqlalchemy import create_engine

from .serializer import make_row_serializable


class SqlHandler(IPythonHandler):
    def __init__(self, *args, **kwargs):
        super(SqlHandler, self).__init__(*args, **kwargs)

    async def execute_query(self, connection, query):
        ioloop = tornado.ioloop.IOLoop.current()
        result = await ioloop.run_in_executor(None, connection.execute, query)
        return result

    async def post(self):
        data = json_decode(self.request.body)
        query = data["query"]
        connection_string = data["connectionString"]
        engine = create_engine(connection_string)
        connection = engine.connect()
        try:
            result = await self.execute_query(connection, query)
            if result.returns_rows:
                keys = result.keys()
                rows = [make_row_serializable(row) for row in result]
                response = {
                    "responseType": "success",
                    "responseData": {
                        "hasRows": True,
                        "keys": keys,
                        "rows": rows
                    }
                }
            else:
                response = {
                    "responseType": "success",
                    "responseData": {
                        "hasRows": False
                    }
                }
        except Exception as e:
            response = {
                "responseType": "error",
                "responseData": {
                    "message": str(e)
                }
            }
        self.finish(json.dumps(response))


def register_handlers(nbapp):
    web_app = nbapp.web_app
    host_pattern = ".*$"
    route_pattern = url_path_join(
        web_app.settings["base_url"],
        "/jupyterlab-sql/query"
    )
    handlers = [(route_pattern, SqlHandler)]
    web_app.add_handlers(host_pattern, handlers)
