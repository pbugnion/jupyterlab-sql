import json
from pathlib import Path
from pkg_resources import resource_string

from jsonschema import Draft7Validator as Validator


SCHEMA_PATH = Path("schemas")


def load(name):
    schema_string = resource_string(__name__, SCHEMA_PATH / name)
    return Validator(json.loads(schema_string))
