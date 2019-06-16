
import pytest

from jupyterlab_sql.request_decoder import decode, RequestDecodeError


def test_decode_not_json():
    body = "not-json"
    with pytest.raises(RequestDecodeError):
        decode(body, None)
