# cython: language_level=3, boundscheck=False, cdivision=True

cimport numpy as np
from ..cdata cimport Data, CData

from ..types cimport DTYPE

cdef int indices(const DTYPE * grid, int grid_l, DTYPE p, 
                    DTYPE * fac, int * ind)


cdef DTYPE n3_interpolate(int * grid_l, const DTYPE * comp, 
                    int * ind, DTYPE * fac)


cdef int nd_interpolate(int dim_l, int com_l, const DTYPE ** grid,
                    int * grid_l, const DTYPE ** comp, 
                    DTYPE * points, int points_l,  
                    DTYPE * output)

cdef DTYPE * co_interpolate(CData * data, DTYPE * points, int points_l, DTYPE * output)

cdef DTYPE * c_interpolate(CData * data, DTYPE * points, 
                    int points_l)

cdef pointer_to_numpy_array(void * ptr, np.npy_intp * size)