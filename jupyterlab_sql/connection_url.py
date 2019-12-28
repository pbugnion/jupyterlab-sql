import sqlalchemy.engine.url


def is_sqlite(url):
    backend = sqlalchemy.engine.url.make_url(url).get_backend_name()
    return backend == "sqlite"


def is_mysql(url):
    backend = sqlalchemy.engine.url.make_url(url).get_backend_name()
    return backend == "mysql"
