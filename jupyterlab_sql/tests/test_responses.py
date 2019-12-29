from jupyterlab_sql.models import DatabaseObjects
from jupyterlab_sql.responses import success_with_database_objects


def test_success_with_database_objects():
    database_objects = DatabaseObjects(
        tables=["t1", "t2"],
        views=["v1", "v2"]
    )
    response = success_with_database_objects(database_objects)
    expected = {"responseType": "success", "responseData": {"tables": ["t1", "t2"], "views": ["v1", "v2"]}}
    assert response == expected
