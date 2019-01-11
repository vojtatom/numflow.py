import timeit

import numpy as np
from scipy.interpolate import RegularGridInterpolator

from ..data import Data, CData
from ..geometry import location
from ..math import interpolate


class GlyphKernel:
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
        self._points = None


    @property
    def data(self):
        return self._data


    @data.setter
    def data(self, d):
        self._data = d


    @property
    def points(self):
        return self._points


    @points.setter
    def points(self, p):
        self._points = p  


    def _is_ready(self):
        """
        Performs checks of internal settings to be compliant with calculation.
        """

        if not all(v is not None for v in (self._points, self._data)):
            raise Exception('Trying to perform computation or empty kernel.')


    def calculate(self) -> dict:
        """
        Perform calculation based on internal settings.

        Uses start, end and sampling, returns dict with structure
            loc: positions/points, np.ndarray with shape (np.prod(sampling), 3)
            val: vector values, np.ndarray with shape (np.prod(sampling), 3)
            nor: dict with min, mean and max lengths of val
        """   


        self._is_ready()

        if self._data.mode == 'c':
            values = interpolate(self._data, self._points)
        else:
            values = self._data(self._points)

        return values


    def _bench(self, count):
        print("=============================\n",
              "\rBenchmarking on {0} random vectors {1} times\n".format(self._points.shape[0], count))

        if self._data.mode == 'c':
            def interp():
                interpolate(self._data, self._points)
        else:
            def interp():
                self._data(self._points)

        if self._data.mode == 'c':
            data = self._data(self._points)
        else:
            data = interpolate(self._data, self._points)

        time = timeit.Timer(interp).timeit(count)

        return data, time


    def _print_bench(self, time):
        print("Time:  {0:.10f} s".format(time))
        print("=============================")


    #@profile
    def benchmark(self, components=3) -> None:
        start = self._data.grid_min
        end = self._data.grid_max
        span = end - start
        
        self._points = np.random.rand(1, components) * span + start
        self._is_ready()

        data, time = self._bench(10)
        self._print_bench(time)

        data, time = self._bench(1000)
        self._print_bench(time)

