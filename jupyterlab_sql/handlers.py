import json
from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
from tornado.escape import json_decode
import tornado.ioloop

from .executor import Executor
from . import responses


# TODO: Use schema to validate request

class SqlQueryHandler(IPythonHandler):
    def initialize(self, executor):
        self._executor = executor

    def execute_query(self, connection_url, query):
        result = self._executor.execute_query(connection_url, query)
        return result

    async def post(self):
        data = json_decode(self.request.body)
        query = data["query"]
        connection_url = data["connectionUrl"]
        ioloop = tornado.ioloop.IOLoop.current()
        try:
            result = await ioloop.run_in_executor(
                None, self.execute_query, connection_url, query
            )
            if result.has_rows:
                response = responses.success_with_rows(
                    result.keys, result.rows)
            else:
                response = responses.success_no_rows()
        except Exception as e:
            response = responses.error(str(e))
        self.finish(json.dumps(response))


class StructureHandler(IPythonHandler):

    def initialize(self, executor):
        self._executor = executor

    def get_table_names(self, connection_url):
        result = self._executor.get_table_names(connection_url)
        return result

    async def post(self):
        data = json_decode(self.request.body)
        connection_url = data["connectionUrl"]
        ioloop = tornado.ioloop.IOLoop.current()
        try:
            tables = await ioloop.run_in_executor(
                None, self.get_table_names, connection_url)
            response = responses.success_with_tables(tables)
        except Exception as e:
            response = responses.error(str(e))
        self.finish(json.dumps(response))


class TableStructureHandler(IPythonHandler):

    def initialize(self, executor):
        self._executor = executor

    def get_table_summary(self, connection_url, table_name):
        result = self._executor.get_table_summary(connection_url, table_name)
        return result

    async def post(self):
        data = json_decode(self.request.body)
        connection_url = data["connectionUrl"]
        table_name = data["table"]
        ioloop = tornado.ioloop.IOLoop.current()
        try:
            result = await ioloop.run_in_executor(
                None, self.get_table_summary, connection_url, table_name)
            response = responses.success_with_rows(
                result.keys, result.rows)
        except Exception as e:
            response = responses.error(str(e))
        self.finish(json.dumps(response))


def form_route(web_app, endpoint):
    return url_path_join(
        web_app.settings["base_url"], "/jupyterlab-sql/", endpoint
    )


def register_handlers(nbapp):
    web_app = nbapp.web_app
    host_pattern = ".*$"
    executor = Executor()
    handlers = [
        (form_route(web_app, "query"), SqlQueryHandler, {"executor": executor}),
        (form_route(web_app, "database"), StructureHandler, {"executor": executor}),
        (form_route(web_app, "table"), TableStructureHandler, {"executor": executor})
    ]
    web_app.add_handlers(host_pattern, handlers)
