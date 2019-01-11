# cython: language_level=3

cimport numpy as np
from libc.stdlib cimport malloc, realloc, free
from ..types cimport DTYPE
from ..data.cdata cimport CData
from .rk cimport RKSolver, Status



def solve_ivp(CData data, DTYPE t0, DTYPE t_bound, DTYPE[:,::1] starting_points):
    cdef int points_l = starting_points.shape[0]
    cdef int i
    cdef DTYPE ** ys = <DTYPE **>malloc(points_l * sizeof(DTYPE *))
    cdef DTYPE ** fs = <DTYPE **>malloc(points_l * sizeof(DTYPE *))
    cdef int *    ys_l  = <int *>malloc(points_l * sizeof(int))

    cdef RKSolver solver = RKSolver()
    solver.create(data.c, t0, t_bound)

    cdef DTYPE * y
    cdef DTYPE * v
    cdef int y_l = 0
    cdef int f_l = 0

    for i in range(points_l):
        y = <DTYPE *>malloc(100 * data.dim_l * sizeof(DTYPE))
        f = <DTYPE *>malloc(100 * data.com_l * sizeof(DTYPE))
        y_l = 100 * data.dim_l
        f_l = 100 * data.com_l
        solver.initial_step(&starting_points[i, 0])
        
        ### shouldn't initialize solver with buffers due to future reallocs...

        while solver.status == Status.ready:
            solver.step()

            #print(solver.t)
            #print(solver.y[0], solver.y[1], solver.y[2])
            
        