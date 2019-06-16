from tornado.escape import json_decode
from json.decoder import JSONDecodeError


class RequestDecodeError(Exception):
    pass


def decode(request_body, validator):
    try:
        data = json_decode(request_body)
    except JSONDecodeError:
        raise RequestDecodeError("Request was not valid JSON")
    return data
