import datetime
import uuid


def make_row_serializable(row):
    return tuple(_make_value_serializable(value) for value in row)


def _make_value_serializable(value):
    type_ = type(value)
    processor = DISPATCHER.get(type_)
    if processor is not None:
        return processor(value)
    else:
        return value


def _uuid_processor(uuid):
    return str(uuid)


def _datetime_processor(dt):
    return str(dt)


def _list_processor(l):
    return [_make_value_serializable(value) for value in l]


DISPATCHER = {
    uuid.UUID: _uuid_processor,
    datetime.datetime: _datetime_processor,
    datetime.date: _datetime_processor,
    list: _list_processor,
}
