import numpy as np
import numpy.linalg as la

from memory_profiler import profile


def norm(vectors: np.ndarray) -> dict:
    """
    Calculate minimum, mean and maximum length of vectors.
    of the the original FITS file.
        :param vectors: ndarray with shape (n, 3)
    """

    norms = la.norm(vectors, axis=1)
    del vectors

    stats = {
        'min': np.min(norms), 
        'mean': np.mean(norms), 
        'max': np.max(norms)
    }

    del norms
    return stats


def location(start: np.ndarray, end: np.ndarray, sampling: np.ndarray) -> np.ndarray:
    """
    Compute points location unifromly distrubuted over specified space
    and return np.ndarray with shape (np.prod(sampling), 3).
        :param start:np.ndarray: np.ndarray with shape (3,)
        :param end:np.ndarray: np.ndarray with shape (3,)
        :param sampling:np.ndarray: np.ndarray with shape (3,)
    """

    spc = []
    for s, e, n in zip(start, end, sampling):
        spc.append(np.linspace(s, e, n, endpoint=True))

    k = np.array(np.meshgrid(*spc, sparse=False, indexing='ij'))
    k = np.transpose(k)
    k = np.reshape(k, (np.prod(sampling), 3))

    return k


