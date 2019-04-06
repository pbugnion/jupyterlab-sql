
from sqlalchemy import create_engine
import sqlalchemy.engine.url
from sqlalchemy.pool import StaticPool

from .serializer import make_row_serializable
from .cache import Cache


class QueryResult:
    def __init__(self, keys, rows):
        self.has_rows = rows is not None
        self.keys = keys
        self.rows = rows

    @classmethod
    def from_sqlalchemy_result(cls, result):
        if result.returns_rows:
            keys = result.keys()
            rows = [make_row_serializable(row) for row in result]
            return cls(keys, rows)
        else:
            return cls(None, None)


class QueryExecutor:
    def __init__(self):
        self._sqlite_engine_cache = Cache()

    def execute_query(self, connection_string, query):
        backend = sqlalchemy.engine.url.make_url(
            connection_string
        ).get_backend_name()
        if backend == 'sqlite':
            engine_builder = lambda: create_engine(
                connection_string,
                connect_args={'check_same_thread': False},
                poolclass=StaticPool
            )
            engine = self._sqlite_engine_cache.get_or_set(
                connection_string, engine_builder)
        else:
            engine = create_engine(connection_string)
        result = self._execute_with_engine(engine, query)
        return QueryResult.from_sqlalchemy_result(result)

    def _execute_with_engine(self, engine, query):
        connection = engine.connect()
        result = connection.execution_options(no_parameters=True).execute(
            query
        )
        return result
