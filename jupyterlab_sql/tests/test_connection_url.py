import pytest

import jupyterlab_sql.connection_url as connection_url


@pytest.mark.parametrize(
    "url",
    [
        "sqlite://",
        "sqlite:///test.db",
        "sqlite:////test.db",
        "sqlite+pysqlcipher://:testing@/foo.db?ciph=aes-256-cfb&kdf=64000",
        "sqlite+pysqlite:///file.db",
    ],
)
def test_sqlite(url):
    assert connection_url.is_sqlite(url)


@pytest.mark.parametrize(
    "url", ["postgres://localhost:5432/postgres", "mysql://localhost"]
)
def test_not_sqlite(url):
    assert not connection_url.is_sqlite(url)


@pytest.mark.parametrize(
    "url",
    [
        "mysql:///employees",
        "mysql://localhost/employees",
        "mysql+mysqldb:///employees",
        "mysql+pymysql:///employees"
    ]
)
def test_mysql(url):
    assert connection_url.is_mysql(url)


@pytest.mark.parametrize(
    "url", ["postgres://localhost:5432/postgres", "sqlite://"]
)
def test_not_mysql(url):
    assert not connection_url.is_mysql(url)


@pytest.mark.parametrize(
    "url",
    [
        "mysql:///employees",
        "mysql://localhost/employees",
        "sqlite:///foo.db"
    ]
)
def test_has_database(url):
    assert connection_url.has_database(url)


@pytest.mark.parametrize(
    "url",
    [
        "mysql://",
        "mysql://localhost/",
        "sqlite://"
    ]
)
def test_not_has_database(url):
    assert not connection_url.has_database(url)
