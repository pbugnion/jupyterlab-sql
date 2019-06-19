from json.decoder import JSONDecodeError

from tornado.escape import json_decode
from jsonschema.exceptions import ValidationError


class RequestDecodeError(Exception):
    pass


def decode(request_body, validator):
    try:
        data = json_decode(request_body)
    except JSONDecodeError:
        raise RequestDecodeError("Request was not valid JSON")
    try:
        validator.validate(data)
    except ValidationError as e:
        raise RequestDecodeError(
            "Request contains an invalid payload: {}".format(e.message)
        )
    return data
