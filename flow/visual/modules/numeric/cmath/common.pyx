# cython: language_level=3, boundscheck=False, wraparound=False, nonecheck=False, cdivision=True

cimport numpy as np
from libc.math cimport sqrt

from ..types cimport DTYPE

cdef DTYPE div(DTYPE a, DTYPE b):
    if a < 0:
        if b < 0:
            return -a / -b
        return -(-a / b)
    elif b < 0:
        return -(a / -b)
    return a / b


cdef DTYPE norm(DTYPE * vec, int vec_l):
    cdef int n
    cdef DTYPE sum = 0
    for n in range(vec_l):
        sum += vec[n] * vec[n]
    return div(sqrt(sum), sqrt(vec_l))


cdef DTYPE dot(DTYPE * vec_a, DTYPE * vec_b, int vec_l):
    cdef DTYPE d = 0.0
    cdef int i
    
    for i in range(vec_l):
        d += vec_a[i] * vec_b[i]
    return d

#cdef str_vec(DTYPE * vec, int vec_l):
#    return "[ " + " ".join([str(vec[i]) for i in range(vec_l)]) + " ]"