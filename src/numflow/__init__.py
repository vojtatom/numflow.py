from numflow.compute import RectilinearField3D


def load_field(path: str):
    """
    Load a numflow field from a file.
    """
    field = RectilinearField3D(path)
    return field
    print(path)
    pass