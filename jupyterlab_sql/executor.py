from sqlalchemy import create_engine
from sqlalchemy.sql import select, text, table
from sqlalchemy.pool import StaticPool

from .serializer import make_row_serializable
from .cache import Cache
from .connection_url import is_sqlite


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


class Executor:
    def __init__(self):
        self._sqlite_engine_cache = Cache()

    def get_table_names(self, connection_url):
        engine = self._get_engine(connection_url)
        return engine.table_names()

    def execute_query(self, connection_url, query):
        engine = self._get_engine(connection_url)
        result = self._execute_with_engine(engine, query)
        return QueryResult.from_sqlalchemy_result(result)

    def get_table_summary(self, connection_url, table_name):
        query = select([text("*")]).select_from(table(table_name)).limit(1000)
        return self.execute_query(connection_url, query)

    def _get_engine(self, connection_url):
        if is_sqlite(connection_url):
            engine = self._sqlite_engine_cache.get_or_set(
                connection_url,
                lambda: self._create_sqlite_engine(connection_url),
            )
        else:
            engine = create_engine(connection_url)
        return engine

    def _create_sqlite_engine(self, connection_url):
        engine = create_engine(
            connection_url,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        return engine

    def _execute_with_engine(self, engine, query):
        connection = engine.connect()
        result = connection.execution_options(no_parameters=True).execute(
            query
        )
        return result
