import timeit

import numpy as np

from .math import cstreamlines, sstreamlines
from .data import CData, SData
from .exceptions import NumericError
from .io import cdata, sdata


def dataset_kernel(filepath, mode):
    if mode  == 'scipy':
        return sdata(filepath)
    elif mode == 'c':
        return cdata(filepath)
    else:
        raise NumericError('Unknown dataset format')


def glyph_kernel(data, points):
    interpolator = data.interpolator
    data = interpolator(points)
    return data


def points_kernel(start, end, sampling):
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
    if mode  == 'scipy':
        return sstreamlines(data, t_0, t_bound, points, abort)
    elif mode == 'c':
        return cstreamlines(data, t_0, t_bound, points)
    else:
        raise NumericError('Unknown format.')

