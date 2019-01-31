# cython: language_level=3

cimport numpy as np
from ..types cimport DTYPE

cdef int buffer_realloc(DTYPE ** b, int buffer_l)