import numpy as np
from astropy.io import fits
from scipy.interpolate import RegularGridInterpolator

from ..data import CData, SData
from .common import ascending, byteorder, create_rutine, flip, memmap, open


def create(hdul: fits.HDUList) -> SData:
    """
    Creates interpolator from hdul 
        :param hdul: HDUList of the fits file
    """

    grid, flips = create_rutine(hdul)
    arrays = []

    for i in range(1, 4):
        data = hdul[i].data

        for ax in range(0, 3):
            if not flips[ax]:
                data = np.flip(data, axis=ax)

        fd = data #byteorder(data)
        #fd = memmap(fd)
        arrays.append(fd)

        del fd
        del data
        del hdul[i].data

    interp = RegularGridInterpolator(grid, np.stack(arrays, axis=-1).astype(np.double), 
                                    fill_value=[0, 0, 0], bounds_error=False)
    minim, maxim = np.array([np.amin(x) for x in grid]), np.array([np.amax(x) for x in grid])
    return SData(interp, minim, maxim, 3, 3)


def ccreate(hdul: fits.HDUList) -> CData:
    """
    Creates interpolator from hdul 
        :param hdul: HDUList of the fits file
    """

    grid, flips = create_rutine(hdul)
    obj = CData(3, 3)

    for g in grid:
        g = byteorder(g)
        g = np.ascontiguousarray(g, dtype=np.float)
        obj.add_grid(g)

    for i in range(1, 4):
        data = hdul[i].data
        for ax in range(0, 3):
            if not flips[ax]:
                data = np.flip(data, axis=ax)

        fd = byteorder(data).astype(np.double)
        fd = np.ascontiguousarray(fd, dtype=np.float)
        #fd = memmap(fd)
        obj.add_component3(fd)

        del fd
        del data
        del hdul[i].data

    return obj


def cdata(filename: str):
    """
    Prepares data object for dataset using dataset.
        :param filename: filename of dataset
    """

    hdul = open(filename)
    d = ccreate(hdul) 
    hdul.close()
    return d


def sdata(filename: str):
    """
    Prepares data object for dataset using scipy.
        :param filename: filename of dataset
    """

    hdul = open(filename)
    d = create(hdul) 
    hdul.close()
    return d
