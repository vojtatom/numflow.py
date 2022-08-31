import timeit

import numpy as np

from .math import cstreamlines, sstreamlines
from .data import CData, SData
from .exceptions import NumericError
from .io import cdata, sdata


def dataset_kernel(filepath, mode):
    """
    Kernel launching the dataset loading operation.
        :param filepath: path of the dataset file
        :param mode: required dataset mode (c or scipy)
    """

    if mode  == 'scipy':
        return sdata(filepath)
    elif mode == 'c':
        return cdata(filepath)
    else:
        raise NumericError('Unknown dataset format')


def glyph_kernel(data, points):
    """
    Kernel constructing glyphs.
        :param data: instance of CData or SData class representing the dataset
        :param points: 2D numpy array of glyph seeding points
    """
    
    interpolator = data.interpolator
    data = interpolator(points)
    return data


def points_kernel(start, end, sampling):
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


def stream_kernel(data, t_0, t_bound, points, mode, abort): 
    """
    Kernel launching the streamline integration.
        :param data: dataset
        :param t0: integration start time
        :param t_bound: integration end time
        :param points: 2D numpy array of 
                                integration seeding points 
        :param mode: required dataset mode (c or scipy)
        :param abort: object for chacking the abort flag,
                      check is done by using the check_abort method
    """  

    if mode  == 'scipy':
        return sstreamlines(data, t_0, t_bound, points, abort)
    elif mode == 'c':
        return cstreamlines(data, t_0, t_bound, points)
    else:
        raise NumericError('Unknown format.')

