from scipy.interpolate import RegularGridInterpolator
from ..cdata import Data
from .common import open
from .loader import create, ccreate


def cdata(filename: str) -> Data:
    """
    Prepares data object for dataset using dataset.
        :param filename: filename of dataset
    """

    hdul = open(filename)
    d = ccreate(hdul) 
    hdul.close()
    return d


def data(filename: str) -> list:
    """
    Prepares data object for dataset using scipy.
        :param filename: filename of dataset
    """

    hdul = open(filename)
    d = create(hdul) 
    hdul.close()
    return d