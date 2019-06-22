import json
from pathlib import Path
from pkg_resources import resource_string

from jsonschema import Draft7Validator as Validator


SCHEMAS_PATH = Path("schemas")


def load(name):
    path = SCHEMAS_PATH / name
    schema_string = resource_string(__name__, str(path)).decode("utf-8")
    return Validator(json.loads(schema_string))
