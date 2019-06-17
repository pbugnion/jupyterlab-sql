import json

from jsonschema import Draft7Validator as Validator

import pytest

from jupyterlab_sql.request_decoder import decode, RequestDecodeError


test_schema = {
    "type": "object",
    "properties": {"prop": {"type": "string"}},
    "required": ["prop"],
}

test_body = {"prop": "value"}


def test_decode_not_json():
    body = "not-json"
    with pytest.raises(RequestDecodeError):
        decode(body, None)


def test_decode_incorrect_json():
    body = json.dumps({"invalid": "json"})
    validator = Validator(test_schema)
    with pytest.raises(RequestDecodeError):
        decode(body, validator)


def test_decode():
    body_str = json.dumps(test_body)
    validator = Validator(test_schema)
    data = decode(body_str, validator)
    assert data == test_body
