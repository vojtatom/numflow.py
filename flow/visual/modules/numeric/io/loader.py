import numpy as np
from astropy.io import fits
from scipy.interpolate import RegularGridInterpolator

from ..data import CData, Data
from .common import ascending, flip, byteorder, memmap, create_rutine



def create(hdul: fits.HDUList) -> list:
    """
    Creates interpolator from hdul 
        :param hdul: HDUList of the fits file
    """

    grid, flips = create_rutine(hdul)
    arrays = []

    for i in range(1, 4):
        data = hdul[i].data

        if not flips[i - 1]:
            data = np.flip(data, axis=2)

        fd = data #byteorder(data)
        #fd = memmap(fd)
        arrays.append(fd)

        del fd
        del data
        del hdul[i].data

    interp = RegularGridInterpolator(grid, np.stack(arrays, axis=-1).astype(np.double), fill_value=[0, 0, 0], bounds_error=False)
    minim, maxim = np.array([np.amin(x) for x in grid]), np.array([np.amax(x) for x in grid])
    return Data(interp, minim, maxim)


def ccreate(hdul: fits.HDUList) -> Data:
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
        if not flips[i - 1]:
            data = np.flip(data, axis=2)

        fd = byteorder(data).astype(np.double)
        fd = np.ascontiguousarray(fd, dtype=np.float)
        #fd = memmap(fd)
        obj.add_component3(fd)

        del fd
        del data
        del hdul[i].data

    return obj