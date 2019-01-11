import numpy as np
from scipy.interpolate import RegularGridInterpolator

from memory_profiler import profile
from typing import List

class Data:
    """
    Object with data information including
    interpolators and axis ranges.

        :prop x: interpolator over x axes
        :prop y: interpolator over y axes
        :prop z: interpolator over z axes

        :method vectors: interpolate vectors in points
    """

    def __init__(self, data: dict) -> None:
        """
        Create new instance of Data object, requires dict with values:

            x: RegularGridInterpolator
            y: RegularGridInterpolator
            z: RegularGridInterpolator

            axis_min: min positions, np.ndarray with shape (3,)
            axis_max: max positions, np.ndarray with shape (3,)


            :param self: 
            :param data:dict: 
        """
        
        self._interp_x = data['x']
        self._interp_y = data['y']
        self._interp_z = data['z']
        self._axis_min = np.array(data['axis_min'])
        self._axis_max = np.array(data['axis_max'])
        setattr(Data.inside_t, 'terminal', True)


    @property
    def x(self) -> RegularGridInterpolator:
        return self._interp_x


    @property
    def y(self) -> RegularGridInterpolator:
        return self._interp_y


    @property
    def z(self) -> RegularGridInterpolator:
        return self._interp_z


    @property
    def axis(self) -> dict:
        return {
            'min' : self._axis_min,
            'max' : self._axis_max,
        }
    

    @property
    def min(self) -> dict:
        return self._axis_min


    @property
    def max(self) -> dict:
        return self._axis_max


    @property
    def interp(self) -> List[RegularGridInterpolator]:
        return self._interp_x, self._interp_y, self._interp_z
        

    def vectors(self, n: np.ndarray) -> np.ndarray:
        data = [self._interp_x(n), self._interp_y(n), self._interp_z(n)]
        data = np.transpose(data)
        return data


    def vectors_t(self, t: float, n: np.ndarray) -> np.ndarray:
        data = [self._interp_x(n), self._interp_y(n), self._interp_z(n)]
        data = np.transpose(data)
        return data


    def inside(self, n: np.ndarray) -> np.ndarray:
        a = 1 if n.ndim > 1 else 0
        return np.prod((self._axis_max - n) * (n - self._axis_min), axis=a)


    def inside_t(self, t: float, n: np.ndarray) -> np.ndarray:
        return np.prod((self._axis_max - n) * (n - self._axis_min))

