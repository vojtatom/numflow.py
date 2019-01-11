# cython: language_level=3
cimport numpy as np
from ..types cimport DTYPE

cdef DTYPE div(DTYPE a, DTYPE b)

cdef DTYPE norm(DTYPE * vec, int vec_l)

cdef DTYPE dot(DTYPE * vec_a, DTYPE * vec_b, int vec_l)

#cdef str_vec(DTYPE * vec, int vec_l)

