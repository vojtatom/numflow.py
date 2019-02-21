# cython: language_level=3

cimport numpy as np
from libc.stdlib cimport malloc, realloc, free
from ..types cimport DTYPE, INTDTYPE
from ..data.cdata cimport CData
from .rk cimport RKSolver, Status
from cython.operator cimport dereference as deref
from .common cimport pointer_to_two_d_numpy_array, pointer_to_float_one_d_numpy_array, pointer_to_int_one_d_numpy_array

import numpy as np
from scipy.integrate import solve_ivp


cdef int buffer_realloc(DTYPE ** b, int buffer_l):
    cdef DTYPE * new_b

    #when buffer is full, realloc
    buffer_l *= 2
    new_b = <DTYPE *>realloc(<void *>deref(b), buffer_l * sizeof(DTYPE))

    # in case realloc fails here...
    if new_b == NULL:
        return 0
    
    #copy happy pointer
    b[0] = new_b

    return buffer_l  


def cstreamlines(CData data, DTYPE t0, DTYPE t_bound, DTYPE[:,::1] starting_points):
    cdef int points_l = starting_points.shape[0]
    cdef int i, j, tmp_yl, tmp_fl, tmp_tl
    cdef int buffer_l = 100 * data.c.com_l
    cdef int buffer_u = 0
    cdef int buffer_tl = buffer_l // data.c.com_l
    cdef int buffer_tu = 0
    cdef int streamline_l
    cdef DTYPE * y = <DTYPE *>malloc(buffer_l * sizeof(DTYPE))
    cdef DTYPE * f = <DTYPE *>malloc(buffer_l * sizeof(DTYPE))
    cdef DTYPE * t = <DTYPE *>malloc(buffer_tl * sizeof(DTYPE))
    cdef INTDTYPE * l = <INTDTYPE *>malloc(points_l * sizeof(INTDTYPE))
    cdef np.npy_intp dims[2]
    cdef np.npy_intp dims_single[1]

    cdef RKSolver solver = RKSolver()
    solver.create(data.c, t0, t_bound)

    #make streamline from each of the points
    for i in range(points_l):
        solver.initial_step(&starting_points[i, 0])
        streamline_l = 1

        #when buffer is full, realloc
        if buffer_u == buffer_l:
            tmp_yl = buffer_realloc(&y, buffer_l)
            tmp_fl = buffer_realloc(&f, buffer_l)
            tmp_tl = buffer_realloc(&t, buffer_tl)
            
            # when realloc fails
            if tmp_yl == 0 or tmp_fl == 0 or tmp_tl == 0:
                free(y)
                free(f)
                free(l)
                free(t)
                return None, None, None, None
            else:
                buffer_l = tmp_yl
                buffer_tl = tmp_tl

        #copy initial points and function values from inside solver
        for j in range(data.c.com_l):
            y[buffer_u] = solver.y[j]
            f[buffer_u] = solver.f[j]
            buffer_u += 1
        
        t[buffer_tu] = solver.t
        buffer_tu += 1

        #while solver is happy
        while solver.status == Status.ready:
            solver.step()
            streamline_l += 1  

            #when buffer is full, realloc
            if buffer_u == buffer_l:
                tmp_yl = buffer_realloc(&y, buffer_l)
                tmp_fl = buffer_realloc(&f, buffer_l)
                tmp_tl = buffer_realloc(&t, buffer_tl)
                
                # when realloc fails
                if tmp_yl == 0 or tmp_fl == 0 or tmp_tl == 0:
                    free(y)
                    free(f)
                    free(l)
                    free(t)
                    return None, None, None, None
                else:
                    buffer_l = tmp_yl
                    buffer_tl = tmp_tl

            #copy points and function values from inside solver
            for j in range(data.c.com_l):
                y[buffer_u] = solver.y[j]
                f[buffer_u] = solver.f[j]
                buffer_u += 1

            t[buffer_tu] = solver.t
            buffer_tu += 1
            
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
    lengths = pointer_to_int_one_d_numpy_array(l, dims_single)

    #create numpy array for time
    dims_single[0] = buffer_tl
    times = pointer_to_float_one_d_numpy_array(t, dims_single)
    times = np.resize(times, (buffer_tu,))

    return positions, values, lengths, times


def sstreamlines(data, t0, t_bound, starting_points):
    positions = None
    times = None
    lengths = np.empty((starting_points.shape[0],), dtype=np.int)

    if data.mode == 'c':
        ### needs integration of parameter t...
        def interpolate(t, y):
            return data.interpolator(np.array([y,]))[0]
    elif data.mode == 'scipy':
        def interpolate(t, y):
            return data.interpolator(y)
    
    
    for i in range(starting_points.shape[0]):
        sol = solve_ivp(interpolate, (t0, t_bound), starting_points[i])

        if positions is None:
            positions = np.transpose(sol.y)
            times = sol.t
        else:
            positions = np.append(positions, np.transpose(sol.y), axis=0)
            times = np.append(times, np.transpose(sol.t), axis=0)

        lengths[i] = sol.t.shape[0]

    values = data.interpolator(positions)
    
    del interpolate
    return positions, values, lengths, times
