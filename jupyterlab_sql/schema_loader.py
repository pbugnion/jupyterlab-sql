from pkg_resources import resource_string
import json
from jsonschema import Draft7Validator as Validator


def load(name):
    schema_string = resource_string(__name__, f"schemas/{name}")
    return Validator(json.loads(schema_string))
