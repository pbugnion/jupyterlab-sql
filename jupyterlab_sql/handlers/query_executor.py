
from sqlalchemy import create_engine

from .serializer import make_row_serializable


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
    def execute_query(self, connection_string, query):
        engine = create_engine(connection_string)
        result = self._execute_with_engine(engine, query)
        return QueryResult.from_sqlalchemy_result(result)

    def _execute_with_engine(self, engine, query):
        connection = engine.connect()
        result = connection.execution_options(no_parameters=True).execute(
            query
        )
        return result
