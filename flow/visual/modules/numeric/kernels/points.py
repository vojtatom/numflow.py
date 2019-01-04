import time
import timeit

import numpy as np
from memory_profiler import profile
from scipy.interpolate import RegularGridInterpolator

from ..cdata import Data
from ..geometry import location
from ..cmath import interpolate


class PointsKernel:
    """
    Object to perform calculations on individual points.

        :prop start: np.ndarray with shape (3,)
        :prop end: np.ndarray with shape (3,)
        :prop sampling: np.ndarray with shape (3,)

        :method calculate: perform calculation
    """

    def __init__(self) -> None:
        """
        Initializes kernel to perform calculation on single points.
        Designed for glyph vizualization.
        """

        self._data = None
        self._cdata = None
        self._start = None
        self._end = None
        self._sampling = None


    @property
    def data(self) -> RegularGridInterpolator:
        return self._data


    #@data.setter
    def data(self, d, minim, maxim) -> None:
        self._data = d
        self._start = minim
        self._end = maxim
        self._auto_sample()


    @property
    def cdata(self) -> Data:
        return self._cdata


    @cdata.setter
    def cdata(self, d) -> None:
        self._cdata = d
        self._start = d.grid_min
        self._end = d.grid_max
        self._auto_sample()


    @property
    def start(self) -> np.ndarray:
        return self._start


    @start.setter
    def start(self, s) -> None:
        self._start = s


    @property
    def end(self) -> np.ndarray:
        return self._end


    @end.setter
    def end(self, e) -> None:
        self._end = e


    @property
    def sampling(self) -> np.ndarray:
        return self._sampling


    @sampling.setter
    def sampling(self, s) -> None:
        self._sampling = s


    def _auto_sample(self):
        s = np.array(self._end - self._start).astype(int)
        fac = np.cbrt(np.prod(s) / 1000000)   
        self._sampling = np.array(s / fac).astype(int)


    def _is_ready(self, data=None):
        """
        Performs checks of internal settings to be compliant with calculation.
        """

        if data is None:
            data = (self._data, self._cdata)
        else:
            data = (data,)

        if not all(v is not None for v in (self._start, self._end, self._sampling, *data)):
            raise Exception('Trying to perform computation or empty kernel.')
        
        if not np.all(self._start < self._end):
            raise Exception('Start not less then end.')


    #@profile
    def calculate(self, cmode=True) -> dict:
        """
        Perform calculation based on internal settings.
            :param cmode: True if cython implementation should be used

        Uses start, end and sampling, returns dict with structure
            loc: positions/points, np.ndarray with shape (np.prod(sampling), 3)
            val: vector values, np.ndarray with shape (np.prod(sampling), 3)
            nor: dict with min, mean and max lengths of val
        """   


        self._is_ready(self._cdata if cmode else self._data)
        points = location(self._start, self._end, self._sampling)

        if cmode:
            values = interpolate(self._cdata, points)
        else:
            values = self._data(points)

        return values

    def _bench(self, points, count):
        print("=============================\n",
              "\rBenchmarking on {0} random vectors {1} times\n".format(points.shape[0], count))

        def interp():
            self._data(points)

        np_time = timeit.Timer(interp).timeit(count)
        a = self._data(points)

        def cinterp():
            interpolate(self._cdata, points)

        c_time = timeit.Timer(cinterp).timeit(count)
        b = interpolate(self._cdata, points)

        return np.allclose(a, b, atol=0, rtol=1e-10), np.array_equal(a, b), np_time, c_time


    def _print_bench(self, diff, diff_abs, np_time, c_time):
        print("Diff in tolerance:", diff)
        print("Diff absolute:    ", diff_abs)
        print("Time using scipy:  {0:.10f} s".format(np_time))
        print("Cython time:       {0:.10f} s".format(c_time))
        print("Cython speedup:    {0:.10f} x".format(np_time / c_time))
        print("=============================")


    #@profile
    def benchmark(self) -> None:
        self._is_ready()

        start = self._cdata.grid_min
        end = self._cdata.grid_max
        span = end - start
        comp = self._cdata.com_l

        points = np.random.rand(1, comp) * span + start
        diff, diff_abs, np_time, c_time = self._bench(points, 1000)
        self._print_bench(diff, diff_abs, np_time, c_time)

        points = np.random.rand(1000, comp) * span + start
        diff, diff_abs, np_time, c_time = self._bench(points, 10)
        self._print_bench(diff, diff_abs, np_time, c_time)
