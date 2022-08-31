# cython: language_level=3, boundscheck=False, cdivision=True

cimport numpy as np
from ..data.cdata cimport CData, CSData
from ..types cimport DTYPE


cdef int indices(const DTYPE * grid, int grid_l, DTYPE p, 
                    DTYPE * fac, int * ind)


cdef DTYPE n3_interpolate(int * grid_l, const DTYPE * comp, 
                    int * ind, DTYPE * fac)


cdef int nd_interpolate(int dim_l, int com_l, const DTYPE ** grid,
                    int * grid_l, const DTYPE ** comp, 
                    DTYPE * points, int points_l,  
                    DTYPE * output)

cdef DTYPE * co_interpolate(CSData * data, DTYPE * points, int points_l, DTYPE * output)

cdef DTYPE * c_interpolate(CSData * data, DTYPE * points, 
                    int points_l)