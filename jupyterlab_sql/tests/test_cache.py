
from jupyterlab_sql.handlers.engine_cache import Cache


def test_set_and_retrieve_value():
    c = Cache()
    assert c.get_or_set('key', lambda: 5) == 5
    assert c.get_or_set('key', lambda: 5) == 5
