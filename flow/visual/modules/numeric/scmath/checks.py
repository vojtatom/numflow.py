import numpy as np

EPS = np.finfo(float).eps

def rk_check(fun, t0, y0, t_bound, max_step, rtol, atol):
    #check y0
    if y0.ndim != 1:
        raise ValueError("`y0` must be 1-dimensional.")

    if y0.size == 0:
        raise ValueError("`y0` must not be empty")

    y0 = np.asarray(y0)

    if np.issubdtype(y0.dtype, np.complexfloating):
        dtype = complex
    else:
        dtype = float

    y0 = y0.astype(dtype, copy=False)
    n = y0.size

    #check max_step
    if max_step <= 0:
        raise ValueError("`max_step` must be positive.")

    #check rtol
    if rtol < 100 * EPS:
        print("`rtol` is too low, setting to {}".format(100 * EPS))
        rtol = 100 * EPS

    #check atol
    atol = np.asarray(atol)

    if atol.ndim > 0 and atol.shape != (n,):
        raise ValueError("`atol` has wrong shape.")

    if np.any(atol < 0):
        raise ValueError("`atol` must be positive.")

    return y0, rtol