from unittest.mock import Mock

from jupyterlab_sql.cache import Cache


def test_set_and_retrieve_value():
    c = Cache()
    assert c.get_or_set("key", lambda: 5) == 5
    assert c.get_or_set("key", lambda: 5) == 5


def test_no_reevaluation():
    c = Cache()
    c.get_or_set("key", lambda: 5)
    mock_builder = Mock()
    assert c.get_or_set("key", mock_builder) == 5
    mock_builder.assert_not_called()


def test_multiple_keys():
    c = Cache()
    assert c.get_or_set("key1", lambda: 5) == 5
    assert c.get_or_set("key2", lambda: 6) == 6
