# cython: language_level=3, boundscheck=False

cimport numpy as np
from ..data.cdata cimport CSData
from ..types cimport DTYPE


cdef extern from "math.h":
    double nextafter(double start, double to)


cdef enum Status:
    ready = 1
    finished = 2
    failed = 3
    

cdef class RKSolver:
    cdef int     order
    cdef int     n_stages
    cdef int     n
    cdef int     status
    cdef int     direction
    cdef int     initialized
    cdef DTYPE   t
    cdef DTYPE   t_bound
    cdef DTYPE   rtol
    cdef DTYPE   atol
    cdef DTYPE   ern
    cdef DTYPE   h_abs
    cdef DTYPE * K
    cdef CSData * cdata

    ### vectors
    cdef DTYPE * y
    cdef DTYPE * f 
    cdef DTYPE * y1
    cdef DTYPE * f1
    cdef DTYPE * sc
    cdef DTYPE * yt
    cdef DTYPE * ft
    cdef DTYPE * er

    cdef void create(self, CSData * cdata, DTYPE t0, DTYPE t_bound)

    cdef void initial_step(self, DTYPE * y0)

    cdef void step(self)

    cdef void rk_step(self, DTYPE h)