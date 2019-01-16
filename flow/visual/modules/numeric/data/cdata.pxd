# cython: language_level=3

cimport numpy as np
from ..types cimport DTYPE

cdef struct s_CSData:
    int dim_l
    int com_l
    int * grid_l   
    const DTYPE ** grid
    const DTYPE ** comp

ctypedef s_CSData CSData


cdef class CData:
    cdef CSData * c
    cdef int grid_alloc
    cdef int comp_alloc
    cdef object np_grid
    cdef object np_comp

    #methods
    cdef int _grid(self, const DTYPE * g, int grid_l)
    cdef int _component(self, const DTYPE * c)
    cpdef interpolate(self, DTYPE[:,::1] points)