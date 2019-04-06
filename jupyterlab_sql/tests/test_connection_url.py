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
