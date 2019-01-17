# cython: language_level=3

cimport numpy as np
from libc.stdlib cimport malloc, realloc, free
from ..types cimport DTYPE, INTDTYPE
from ..data.cdata cimport CData
from .rk cimport RKSolver, Status
from .common cimport pointer_to_two_d_numpy_array, pointer_to_one_d_numpy_array

import numpy as np
from scipy.integrate import solve_ivp


def cstreamlines(CData data, DTYPE t0, DTYPE t_bound, DTYPE[:,::1] starting_points):
    cdef int points_l = starting_points.shape[0]
    cdef int i, j
    cdef int buffer_l = 100 * data.c.com_l, buffer_u = 0, streamline_l
    cdef DTYPE * new_y
    cdef DTYPE * new_v
    cdef DTYPE * y = <DTYPE *>malloc(buffer_l * sizeof(DTYPE))
    cdef DTYPE * f = <DTYPE *>malloc(buffer_l * sizeof(DTYPE))
    cdef INTDTYPE * l = <INTDTYPE *>malloc(points_l * sizeof(INTDTYPE))
    cdef np.npy_intp dims[2]
    cdef np.npy_intp dims_single[1]

    cdef RKSolver solver = RKSolver()
    solver.create(data.c, t0, t_bound)

    #make streamline from each of the points
    for i in range(points_l):
        solver.initial_step(&starting_points[i, 0])
        streamline_l = 0
        
        #while solver is happy
        while solver.status == Status.ready:
            solver.step()
            streamline_l += 1  

            #when buffer is full, realloc
            if buffer_u == buffer_l:
                buffer_l += 100 * data.c.com_l
                new_y = <DTYPE *>realloc(<void *>y, buffer_l * sizeof(DTYPE))
                new_f = <DTYPE *>realloc(<void *>f, buffer_l * sizeof(DTYPE))

                # in case realloc fails here...
                if new_y == NULL or new_f == NULL:
                    free(y)
                    free(f)
                    free(l)
                    return None
                
                #copy happy pointer
                y = new_y
                f = new_f        

            #copy points and function values from inside solver
            for j in range(data.c.com_l):
                y[buffer_u] = solver.y[j]
                f[buffer_u] = solver.f[j]
                buffer_u += 1
            
        l[i] = streamline_l

    # create numpy array for values and positions
    dims[0] = buffer_l // data.c.com_l
    dims[1] = data.c.com_l
    positions = pointer_to_two_d_numpy_array(y, dims)
    positions = np.resize(positions, (buffer_u // data.c.com_l, data.c.com_l))
    values = pointer_to_two_d_numpy_array(f, dims)
    values = np.resize(values, (buffer_u // data.c.com_l, data.c.com_l))
    
    #create numpy array for lengths
    dims_single[0] = points_l
    lengths = pointer_to_one_d_numpy_array(l, dims_single)
    return positions, values, lengths


def sstreamlines(data, t0, t_bound, starting_points):
    interpolator = data.interpolator
    positions = None
    lengths = np.empty((starting_points.shape[0],))

    if data.mode == 'c':
        ### needs integration of parameter t...
        def interpolate(t, y):
            return interpolator(np.array([y,]))[0]
    elif data.mode == 'scipy':
        def interpolate(t, y):
            return interpolator(y)
    
    
    for i in range(starting_points.shape[0]):
        sol = solve_ivp(interpolate, (t0, t_bound), starting_points[i])

        if positions is None:
            positions = np.transpose(sol.y)
        else:
            positions = np.append(positions, np.transpose(sol.y), axis=0)

        lengths[i] = sol.t.shape[0]

    values = interpolator(positions)
    return positions, values, lengths
