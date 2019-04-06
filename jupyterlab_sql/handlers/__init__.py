import json
from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
from tornado.escape import json_decode
import tornado.ioloop

from sqlalchemy import create_engine

from .serializer import make_row_serializable



class SqlHandler(IPythonHandler):
    def execute_query(self, engine, query):
        connection = engine.connect()
        result = connection.execution_options(no_parameters=True).execute(
            query
        )
        return result

    def error_response(self, message):
        response = {
            "responseType": "error",
            "responseData": {"message": message},
        }
        return response

    async def post(self):
        data = json_decode(self.request.body)
        query = data["query"]
        connection_string = data["connectionString"]
        try:
            engine = create_engine(connection_string)
        except Exception as e:
            message = "Error creating database engine: \n{}".format(e)
            return self.finish(self.error_response(message))
        ioloop = tornado.ioloop.IOLoop.current()
        try:
            result = await ioloop.run_in_executor(
                None, self.execute_query, engine, query
            )
            if result.returns_rows:
                keys = result.keys()
                rows = [make_row_serializable(row) for row in result]
                response = {
                    "responseType": "success",
                    "responseData": {
                        "hasRows": True,
                        "keys": keys,
                        "rows": rows,
                    },
                }
            else:
                response = {
                    "responseType": "success",
                    "responseData": {"hasRows": False},
                }
        except Exception as e:
            response = self.error_response(str(e))
        self.finish(json.dumps(response))


def register_handlers(nbapp):
    web_app = nbapp.web_app
    host_pattern = ".*$"
    route_pattern = url_path_join(
        web_app.settings["base_url"], "/jupyterlab-sql/query"
    )
    handlers = [(route_pattern, SqlHandler)]
    web_app.add_handlers(host_pattern, handlers)
