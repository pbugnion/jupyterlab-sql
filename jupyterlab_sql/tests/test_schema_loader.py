from jupyterlab_sql.schema_loader import load


def test_load_schema():
    schema = load("sql-query.json")
    schema.validate({"query": "some-query", "connectionUrl": "some-url"})
