

class NodeError(Exception):
    def __init__(self, message):
        super().__init__(message)


class EditorError(Exception):
    def __init__(self, message):
        super().__init__(message)