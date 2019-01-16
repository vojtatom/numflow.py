# cython: language_level=3, boundscheck=False

from libc.stdlib cimport malloc, free
from cython.operator cimport dereference as deref
cimport numpy as np
from ..types cimport DTYPE
from ..math.interpolate cimport c_interpolate, pointer_to_numpy_array

import cython
import numpy as np
from ..exceptions import NumericError

np.import_array()


cdef class CData: 
    mode = 'c'

    def __init__(self, int com, int dim):
        self.c = <CSData *> malloc(sizeof(CSData))
        self.c.grid = <const DTYPE **> malloc(dim * sizeof(const DTYPE *))
        self.c.comp = <const DTYPE **> malloc(com * sizeof(const DTYPE *))
        self.c.grid_l = <int *> malloc(dim * sizeof(int))
        self.c.dim_l = dim
        self.c.com_l = com
        
        self.np_grid = []
        self.np_comp = []
        self.grid_alloc = 0
        self.comp_alloc = 0


    def __dealloc__(self):
        free(self.c.grid)
        free(self.c.comp)
        free(self.c.grid_l)
        free(self.c)

    
    @property
    def grid_min(self):
        """
        Standard DATA api: vector representing locations
        on lowest indices along each axis - minimal
        x, y, z locations where the interpolation is possible.
        """
        values = []
        for d in range(self.c.dim_l):
            values.append(self.c.grid[d][0])
        
        return np.array(values)


    @property
    def grid_max(self):
        """
        Standard DATA api: vector representing locations
        on highest indices along each axis - maximal
        x, y, z locations where the interpolation is possible.
        """
        values = []
        for d in range(self.c.dim_l):
            values.append(self.c.grid[d][self.c.grid_l[d] - 1])
        return np.array(values)


    @property
    def com_l(self):
        """
        Standard DATA api: number of components
        in interpolated vectors.
        """
        return self.c.com_l


    @property
    def dim_l(self):
        """
        Standard DATA api: number of time and spatial
        dimensions required for interpolations.
        """
        return self.c.dim_l


    @property
    def interpolator(self):
        """
        Standard DATA api: Returns interpolating function.
        """
        return self.interpolate


    cpdef interpolate(self, DTYPE[:,::1] points):
        """
        Standard DATA api: Performs interpolation in supplied points.
        Returns np.ndarray with shape (N, comp) where comp 
        is numer of components.

            :param DTYPE[:,::1] points: np.ndarray with shape (N, dim) where dim is numer of dimensions
        """

        cdef DTYPE * a = c_interpolate(self.c, &points[0, 0], points.shape[0])
        cdef np.npy_intp dims[2]

        if a == NULL:
            raise NumericError('Interpolation on requested dimensions not implemented.')
        
        dims[0] = points.shape[0]
        dims[1] = self.c.com_l
        arr = pointer_to_numpy_array(a, dims)
        return arr


    def add_component3(self, const DTYPE[:,:,::1] c):
        """
        Add 3D component to data. 
        """

        self.np_comp.append(c)
        cdef int i = self._component(&c[0, 0, 0])

        if i < 0:
            raise NumericError('Invalid operation while adding a component.')


    def add_grid(self, const DTYPE[::1] g):
        """
        Add axis for interpolation.
        """

        self.np_grid.append(g)
        cdef int i = self._grid(&g[0], g.shape[0])

        if i < 0:
            raise NumericError('Invalid operation while adding a grid.') 

############################################################################

    cdef int _grid(self, const DTYPE * g, int grid_l):
        if self.grid_alloc == self.c.dim_l:
            return -1
        
        self.c.grid[self.grid_alloc] = g
        self.c.grid_l[self.grid_alloc] = grid_l
        self.grid_alloc += 1
        return 0


    cdef int _component(self, const DTYPE * c):
        if self.comp_alloc == self.c.com_l:
            return -1

        self.c.comp[self.comp_alloc] = c
        self.comp_alloc += 1
        return 0


