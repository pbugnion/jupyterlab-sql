import json
from contextlib import contextmanager

from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
import tornado.ioloop

from . import responses
from . import schema_loader
from . import request_decoder
from .executor import Executor


class SqlQueryHandler(IPythonHandler):
    def initialize(self, executor):
        self._executor = executor
        self._validator = schema_loader.load("sql-query.json")

    def execute_query(self, connection_url, query):
        result = self._executor.execute_query(connection_url, query)
        return result

    @contextmanager
    def decoded_request(self):
        try:
            data = request_decoder.decode(self.request.body, self._validator)
            query = data["query"]
            connection_url = data["connectionUrl"]
            yield query, connection_url
        except request_decoder.RequestDecodeError as e:
            response = responses.error(str(e))
            return self.finish(json.dumps(response))

    async def post(self):
        with self.decoded_request() as (query, connection_url):
            ioloop = tornado.ioloop.IOLoop.current()
            try:
                result = await ioloop.run_in_executor(
                    None, self.execute_query, connection_url, query
                )
                if result.has_rows:
                    response = responses.success_with_rows(
                        result.keys, result.rows
                    )
                else:
                    response = responses.success_no_rows()
            except Exception as e:
                response = responses.error(str(e))
            self.finish(json.dumps(response))


class StructureHandler(IPythonHandler):
    def initialize(self, executor):
        self._executor = executor
        self._validator = schema_loader.load("database-structure.json")

    def get_table_names(self, connection_url):
        result = self._executor.get_table_names(connection_url)
        return result

    @contextmanager
    def decoded_request(self):
        try:
            data = request_decoder.decode(self.request.body, self._validator)
            connection_url = data["connectionUrl"]
            yield connection_url
        except request_decoder.RequestDecodeError as e:
            response = responses.error(str(e))
            return self.finish(json.dumps(response))

    async def post(self):
        with self.decoded_request() as connection_url:
            ioloop = tornado.ioloop.IOLoop.current()
            try:
                tables = await ioloop.run_in_executor(
                    None, self.get_table_names, connection_url
                )
                response = responses.success_with_tables(tables)
            except Exception as e:
                response = responses.error(str(e))
            return self.finish(json.dumps(response))


class TableStructureHandler(IPythonHandler):
    def initialize(self, executor):
        self._executor = executor
        self._validator = schema_loader.load("table-structure.json")

    def get_table_summary(self, connection_url, table_name):
        result = self._executor.get_table_summary(connection_url, table_name)
        return result

    @contextmanager
    def decoded_request(self):
        try:
            data = request_decoder.decode(self.request.body, self._validator)
            connection_url = data["connectionUrl"]
            table_name = data["table"]
            yield connection_url, table_name
        except request_decoder.RequestDecodeError as e:
            response = responses.error(str(e))
            return self.finish(json.dumps(response))

    async def post(self):
        with self.decoded_request() as (connection_url, table_name):
            ioloop = tornado.ioloop.IOLoop.current()
            try:
                result = await ioloop.run_in_executor(
                    None, self.get_table_summary, connection_url, table_name
                )
                response = responses.success_with_rows(
                    result.keys, result.rows
                )
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
        (
            form_route(web_app, "query"),
            SqlQueryHandler,
            {"executor": executor},
        ),
        (
            form_route(web_app, "database"),
            StructureHandler,
            {"executor": executor},
        ),
        (
            form_route(web_app, "table"),
            TableStructureHandler,
            {"executor": executor},
        ),
    ]
    web_app.add_handlers(host_pattern, handlers)
