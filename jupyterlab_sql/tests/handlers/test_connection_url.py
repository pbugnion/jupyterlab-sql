
import pytest

import jupyterlab_sql.handlers.connection_url as connection_url

@pytest.mark.parametrize(
    "url",
    ["sqlite://"]
)
def test_sqlite(url):
    assert connection_url.is_sqlite(url)


@pytest.mark.parametrize(
    "url",
    ["postgres://localhost:5432/postgres"]
)
def test_not_sqlite(url):
    assert not connection_url.is_sqlite(url)
