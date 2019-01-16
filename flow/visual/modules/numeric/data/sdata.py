

class SData:
    mode = 'scipy'

    def __init__(self, data, minimum, maximum, com, dim):
        self._data = data
        self._minimum = minimum
        self._maximum = maximum
        self._com_l = com
        self._dim_l = dim

    @property
    def grid_min(self): 
        """
        Standard DATA api: vector representing locations
        on lowest indices along each axis - minimal
        x, y, z locations where the interpolation is possible.
        """
        return self._minimum

    @property
    def grid_max(self):
        """
        Standard DATA api: vector representing locations
        on highest indices along each axis - maximal
        x, y, z locations where the interpolation is possible.
        """
        return self._maximum
    
    @property
    def com_l(self):
        """
        Standard DATA api: number of components
        in interpolated vectors.
        """
        return self.com_l


    @property
    def dim_l(self):
        """
        Standard DATA api: number of time and spatial
        dimensions required for interpolations.
        """
        return self.dim_l


    @property
    def interpolator(self):
        """
        Standard DATA api: Returns interpolating function.
        """
        return self._data


    def interpolate(self, points):
        """
        Standard DATA api: Performs interpolation in supplied points.
        Returns np.ndarray with shape (N, comp) where comp 
        is numer of components.

            :param points: np.ndarray with shape (N, dim) where dim is numer of dimensions
        """
        return self._data(points)