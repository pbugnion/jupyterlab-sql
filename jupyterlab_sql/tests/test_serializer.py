import datetime
import uuid
import decimal

import pytest

from jupyterlab_sql.serializer import make_row_serializable


@pytest.mark.parametrize(
    "test_input",
    [
        ((1, "hello"),),
        ((1, {"some": "dict"}),),
        ((1, {"some": ["array", "in", "dict"]}),),
    ],
)
def test_make_row_serializable_unchanged(test_input):
    assert make_row_serializable(test_input) == test_input


def test_serialize_uuid():
    uuid_str = "6e1d16e3-ca00-4e96-9735-95bf92a8c46c"
    row = (1, uuid.UUID(uuid_str))
    assert make_row_serializable(row) == (1, uuid_str)


def test_serialize_datetime():
    dt = datetime.datetime(2019, 2, 10, 11, 45, 22)
    expected_str = "2019-02-10 11:45:22"
    row = (1, dt)
    assert make_row_serializable(row) == (1, expected_str)


def test_serialize_date():
    dt = datetime.date(2019, 2, 10)
    expected_str = "2019-02-10"
    row = (1, dt)
    assert make_row_serializable(row) == (1, expected_str)


def test_serialize_uuid_array():
    uuid1_str = "1cfdc7b5-f320-4885-9b50-3cefc20a462a"
    uuid2_str = "bfd96545-bd8b-41bb-b9fc-afb57f7d1328"
    row = (1, [uuid.UUID(uuid1_str), uuid.UUID(uuid2_str)])
    assert make_row_serializable(row) == (1, [uuid1_str, uuid2_str])


@pytest.mark.parametrize(
    "test_str",
    [
        "3.14",
        "3.141592653589793238462643383279502884197169399375105820974944592307816",  # noqa
    ],
)
def test_serialize_decimal(test_str):
    dec = decimal.Decimal(test_str)
    row = (1, dec)
    assert make_row_serializable(row) == (1, test_str)
