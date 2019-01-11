import numpy as np
from scipy.integrate import solve_ivp, RK23

from ..geometry import vectors
from ..data import Data, CData

class StreamKernel:
    """
    Object to perform calculations on individual points.

        :prop start: np.ndarray with shape (3,)
        :prop end: np.ndarray with shape (3,)
        :prop sampling: np.ndarray with shape (3,)

        :method calculate: perform calculation
    """

    def __init__(self, data: Data) -> None:
        """
        Initializes kernel to perform calculation on single points.
        Designed for glyph vizualization.

            :param data:Data: initialized Data object 
        """

        self._data = data
        self._start = data.axis['min']
        self._end = data.axis['max']
        s = np.array(data.axis['max'] - data.axis['min']).astype(int)     
        fac = np.cbrt(np.prod(s) / 300)       
        self._sampling = np.array(s / fac).astype(int)
        self._offset = 1

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

    def calculate(self):
        """
        Perform calculation based on internal settings.
        Uses start, end and sampling, returns dict with structure

            loc: positions/points, np.ndarray with shape (np.prod(sampling), 3)
            val: vector values, np.ndarray with shape (np.prod(sampling), 3)
            nor: dict with min, mean and max lengths of val
        """   


        loc = vectors.location(self._start + self._offset, self._end - self._offset, self._sampling)
        sel = loc[self._data.inside(loc).astype(bool)]
        for l in sel:
            solve_ivp(self._data.vectors_t, [0, 10], l, events=self._data.inside_t, method=RK23)

        

