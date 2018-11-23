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

    fits.open(dataset.data.path, checksum=True)



def np__to_file(folder: str, filename: str, dataset: Dataset, array: np.ndarray):
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
