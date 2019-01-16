import timeit

import numpy as np
from scipy.integrate import RK23, solve_ivp

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


def glyph_kernel(data, points, benchmark=False, bench_count=1000):
    interpolator = data.interpolator

    if benchmark:
        def interp():
            interpolator(points)
        time = timeit.Timer(interp).timeit(bench_count)
        data = interpolator(points)
        return data, time
    else:
        data = interpolator(points)
        return data


def points_kernel(start, end, sampling):
    spc = []
    for s, e, n in zip(start, end, sampling):
        spc.append(np.linspace(s, e, n, endpoint=True))

    k = np.array(np.meshgrid(*spc, sparse=False, indexing='ij'))
    k = np.transpose(k)
    k = np.reshape(k, (np.prod(sampling), 3))
    return k


def stream_kernel(data, points, length, mode):
    interpolator = data.interpolator
    
    if mode  == 'scipy':
        raise NumericError('Not implemented.')
    elif mode == 'c':
        raise NumericError('Not implemented.')
    else:
        raise NumericError('Unknown format.')

