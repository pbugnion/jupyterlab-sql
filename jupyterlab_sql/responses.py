
def error(message):
    response = {
        "responseType": "error",
        "responseData": {"message": message},
    }
    return response
