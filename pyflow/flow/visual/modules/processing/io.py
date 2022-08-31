import glob
import json
import os
import zipfile

import numpy as np
from astropy.io import fits
from django.conf import settings

from visual.models import Dataset


def check_file(dataset: Dataset):
    """
    Raises exception if file is not FITS format. 
    """

    HDUList = fits.open(dataset.data.path, checksum=True)
    if HDUList[1].data.shape != HDUList[2].data.shape or \
    HDUList[2].data.shape != HDUList[3].data.shape:
        raise Exception('Data shape incosistent.')

    if HDUList[1].data.ndim < 3 and HDUList[1].data.ndim > 4:
        raise Exception('Data dimensions have to be 3 or 4.')

    if HDUList[1].data.ndim == 3:
        x, y, z = HDUList[1].data.shape
        dimensions = 3
    else:
        raise Exception('Support for time-variable fields has not been implemented yet.')

    if HDUList[4].data.shape != (x,) or \
    HDUList[5].data.shape != (y,) or \
    HDUList[6].data.shape != (z,):
        raise Exception('Ill-sized grid, sizes are not consistent with data.')

    minmax = lambda a : (np.amin(a), np.amax(a))

    min_x, max_x =  minmax(HDUList[4].data)
    min_y, max_y =  minmax(HDUList[5].data)
    min_z, max_z =  minmax(HDUList[6].data)

    description = """Dataset with {} dimensions:
sampling:
    x: {}
    y: {}
    z: {}

axis range of sampling:
    x: {:.6f} - {:.6f}
    y: {:.6f} - {:.6f}
    z: {:.6f} - {:.6f}
""".format(dimensions, x, y, z, min_x, max_x, min_y, max_y, min_z, max_z)

    dataset.description = description



def np_to_file(folder: str, filename: str, dataset: Dataset, array: np.ndarray):
    """
    Numpy array is saved as binary file into
    chosen directory.
    """

    directory = os.path.join(dataset.directory, folder)
    if not os.path.isdir(directory):
        os.mkdir(directory)
    file = os.path.join(directory, filename)
    if os.path.isfile(file):
        os.remove(file)
    np.save(file, array)


def np_to_txt(folder: str, filename: str, dataset: Dataset, array: np.ndarray):
    """
    Numpy array is saved as binary file into
    chosen directory.
    """

    directory = os.path.join(dataset.directory, folder)
    if not os.path.isdir(directory):
        os.mkdir(directory)
    file = os.path.join(directory, filename)
    if os.path.isfile(file):
        os.remove(file)
    np.savetxt(file, array)


def np_from_file(folder: str, filename: str, dataset: Dataset):
    """
    Numpy array is loaded from binary file and returned.
    In case of failiure, None is returned.
    """
    file = os.path.join(dataset.directory, folder, filename)
    try:
        return np.load(file)
    except Exception as e:
        return None


def byte_to_file(folder: str, filename: str, dataset: Dataset, data: bytes):
    """
    Bytes array is saved as binary file into
    chosen directory.
    """

    directory = os.path.join(dataset.directory, folder)
    if not os.path.isdir(directory):
        os.mkdir(directory)
    file = os.path.join(directory, filename)
    if os.path.isfile(file):
        os.remove(file)

    with open(file, 'wb') as output:
        output.write(data)


def byte_from_file(folder: str, filename: str, dataset: Dataset):
    pathdir = os.path.join(dataset.directory, folder)
    path = os.path.join(pathdir, filename)

    if not os.path.isfile(path):
        return None

    with open(path, 'r') as file:
        data = file.read()
        return data
    return None


def meta_to_file(meta: dict, dataset: Dataset, error=False):
    """
    Dict of meta info is saved as json file into
    directory. Special error flag is set on request.
    """

    meta['error'] = error
    path = os.path.join(dataset.directory, 'meta.json')
    with open(path, 'w') as outfile:
        json.dump(meta, outfile, indent=4, sort_keys=True)


def metafromfile(dataset: Dataset):
    metafile = os.path.join(dataset.directory, 'meta.json')
    with open(metafile) as meta:
        data = json.load(meta)
    return data


def load_format(dataset: Dataset):
    path = os.path.join(dataset.directory, 'raw', 'format.json')
    try:
        rawdata = open(path)
        return json.load(rawdata)
    except:
        return None
