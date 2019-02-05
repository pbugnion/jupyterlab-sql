
from jupyterlab_sql.handlers.serializer import make_row_serializable

def test_make_row_serializable():
    inp = (1, 'hello')
    out = (1, 'hello')
    assert make_row_serializable(inp) == out
     
