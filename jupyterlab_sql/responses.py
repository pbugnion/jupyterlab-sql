def error(message):
    response = {"responseType": "error", "responseData": {"message": message}}
    return response


def success_with_rows(keys, rows):
    response = {
        "responseType": "success",
        "responseData": {"hasRows": True, "keys": keys, "rows": rows},
    }
    return response


def success_no_rows():
    response = {"responseType": "success", "responseData": {"hasRows": False}}
    return response


def success_with_database_objects(database_objects):
    response_data = {
        "tables": database_objects.tables,
        "views": database_objects.views,
    }
    response = {"responseType": "success", "responseData": response_data}
    return response
