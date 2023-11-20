import numpy as np

from .compute import RectilinearField3D, interpolate_3d, integrate_3d
from .exceptions import NumflowError


def dataset_kernel(filepath: str):
    """
    Kernel launching the dataset loading operation.
        :param filepath: path of the dataset file
    """
    try: 
        return RectilinearField3D(filepath)
    except Exception as e:
        raise NumflowError(f'Failed to load dataset: {e}')


def glyph_kernel(data: RectilinearField3D, points: np.ndarray):
    """
    Kernel constructing glyphs.
        :param data: instance of RectilinearField3D class representing the dataset
        :param points: 1D array of glyph seeding points
    """
    try:
        return interpolate_3d(data, points)
    except Exception as e:
        raise NumflowError(f'Failed to interpolate data: {e}')


def points_kernel(start: list[float], end: list[float], sampling: list[float]):
    """
    Kernel producing regularly sampled seeding points. 
    The seeding space is defined by bounding cuboid. 
        :param start: near bottom left corner of the cuboid
        :param end: far top right corner of the cuboid
        :param sampling: sampling along individual axes (tuple of 3 ints) 
    """

    spc = []
    for s, e, n in zip(start, end, sampling):
        spc.append(np.linspace(s, e, n, endpoint=True))

    k = np.reshape( \
            np.transpose( \
                np.meshgrid(*spc, sparse=False, indexing='ij') \
                ), (np.prod(sampling), 3) \
        )

    return k

def random_points_kernel(start: list[float], end: list[float], n: int):
    """
    Kernel producing randomly sampled seeding points. 
    The seeding space is defined by bounding cuboid. 
        :param start: near bottom left corner of the cuboid
        :param end: far top right corner of the cuboid
        :param n: number of points to generate
    """

    k = np.zeros((n, 3))
    for i in range(3):
        k[:, i] = np.random.uniform(start[i], end[i], n)

    return k
    

def stream_kernel(data: RectilinearField3D, points: np.ndarray, t_0: float, t_bound: float): 
    """
    Kernel launching the streamline integration.
        :param data: instance of RectilinearField3D class representing the dataset
        :param points: 1D array of integration seeding points 
        :param t0: integration start time
        :param t_bound: integration end time
    """  
    try:
        return integrate_3d(data, points, t_0, t_bound)
    except Exception as e:
        raise NumflowError(f'Failed to integrate data: {e}')

