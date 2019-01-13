from scipy.interpolate import RegularGridInterpolator
from .common import open
from .loader import create, ccreate


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