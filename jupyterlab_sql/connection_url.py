import sqlalchemy.engine.url


def is_sqlite(url):
    backend = _to_sqlalchemy_url(url).get_backend_name()
    return backend == "sqlite"


def is_mysql(url):
    backend = _to_sqlalchemy_url(url).get_backend_name()
    return backend == "mysql"


def has_database(url):
    database = _to_sqlalchemy_url(url).database
    # database is either None or an empty string, depending on
    # whether the URL contains a trailing slash.
    return bool(database)


def _to_sqlalchemy_url(url):
    return sqlalchemy.engine.url.make_url(url)
