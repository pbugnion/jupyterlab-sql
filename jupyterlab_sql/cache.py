class Cache:
    def __init__(self):
        self._cache = {}

    def get_or_set(self, key, value_builder):
        try:
            value = self._cache[key]
        except KeyError:
            value = value_builder()
            self._cache[key] = value
        return value
