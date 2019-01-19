# cython: language_level=3

cimport numpy as np
from ..types cimport DTYPE

cdef int buffers_realloc(DTYPE ** y, DTYPE ** f, int buffer_l)