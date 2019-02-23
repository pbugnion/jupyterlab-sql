from .handlers import register_handlers


def _jupyter_server_extension_paths():
    return [{"module": "jupyterlab_sql"}]


def load_jupyter_server_extension(nbapp):
    nbapp.log.info("Loading server extension jupyterlab_sql")
    register_handlers(nbapp)
