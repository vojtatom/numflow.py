import os.path as path
import sys
import uuid
from tempfile import mkdtemp

import numpy as np
from astropy.io import fits
from memory_profiler import profile


def flip(a: np.ndarray) -> np.ndarray:
    """
    Checks if a is ascending and flips them otehrwise.
        :param a: list or ndarray with shape (n,)
    """

    if np.all(a[:-1] > a[1:]):
        return np.flip(a)
    return a


def ascending(a: np.ndarray) -> bool:
    """
    Checks if values in each subarray are ascending.
        :param a: list or ndarray with shape (n, ...)
    """

    return np.all(a[:-1] < a[1:])


def memmap(data: np.ndarray) -> np.memmap:
    """
    Creates memmap file of data and returns np.memmap in readonly mode.
        :param data: numpy ndarray
    """

    tmpfile = path.join(mkdtemp(), '{}.dat'.format(str(uuid.uuid4())))
    fp = np.memmap(tmpfile, dtype=np.float, mode='w+', shape=np.shape(data))
    fp[:] = data[:]
    fp._mmap.close()
    fp = np.memmap(tmpfile, dtype=np.float, mode='r', shape=np.shape(data))
    return fp


def byteorder(data: np.ndarray) -> np.ndarray:
    """
    Swaps byteorder of numpy array into system format.
        :param data: np.ndarray to be converted
    """
    
    sys_byteorder = ('>', '<')[sys.byteorder == 'little']
    if data.dtype.byteorder not in ('=', sys_byteorder):
        return data.byteswap().newbyteorder(sys_byteorder).astype(np.float)
    return data


def open(filename: str) -> fits.HDUList:
    """
    Opens fits file and checks for consistency.
        :param filename: filename of the fits file.
    """

    hdul = fits.open(filename, memmap=True, mode='denywrite')
    return hdul


def create_rutine(hdul: fits.HDUList) -> list:
    """
    helper function for creating interpolator
        :param hdul: HDUList of the fits file
    """

    grid = [ hdul[4].data.astype(np.double), hdul[5].data.astype(np.double), hdul[6].data.astype(np.double) ]
    flips = [ ascending(a) for a in grid ]
    grid = [ flip(a) for a in grid ]
    c_flips = [ ascending(a) for a in grid ]

    if not np.all(c_flips):
        raise Exception('Data corrupted')

    return grid, flips