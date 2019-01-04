# cython: language_level=3, boundscheck=False, wraparound=False, nonecheck=False, cdivision=True

cimport numpy as np
from cython.operator cimport dereference as deref
from libc.stdlib cimport malloc, free
import numpy as np

from ..types cimport DTYPE
from ..cdata cimport Data, CData
from .common cimport div


np.import_array()


cdef extern from "numpy/arrayobject.h":
        void PyArray_ENABLEFLAGS(np.ndarray arr, int flags)


cdef int indices(const DTYPE * grid, int grid_l, DTYPE p, DTYPE * fac, int * ind):
    """
    Cython implementation of indexing along grids.
    Guesses the index and if fails, perform lookup 
    using bisection method.
        :param const DTYPE * grid:   grid along interpolated axes
        :param int                grid_l: grid length (max index + 1)
        :param DTYPE         p:      value of point along interpolated axes
        :param DTYPE *       fac:    output for factor
        :param int *              ind:    output for index
    """
    
    cdef DTYPE min = grid[0]
    cdef DTYPE max = grid[grid_l - 1]
    cdef int low = 0
    cdef int high = grid_l - 1
    cdef int middle = <int>((grid_l - 1) * (p - min) / (max - min))

    ### check if comp are inside volume
    if (p < min) or p > max:
        return 1

    ### try to predict the index on uniform
    if p >= grid[middle] and p <= grid[middle + 1]:
        low = middle
        high = middle + 1 
    else:
        ### if not guessed, perform binary search
        ### has to have more than one layer!!
        middle = (high - low) // 2
        while high - low != 1:
            if p < grid[middle]:
                high = middle
            else:
                low = middle
            middle =  low + (high - low) // 2  
    
    #[0] is dereference here
    ind[0] = low
    fac[0] = div((p - grid[low]), (grid[high] - grid[low]))
    return 0


cdef DTYPE n3_interpolate(int * grid_l, const DTYPE * comp, int * ind, DTYPE * fac):
    """
    Cython implmentation of trilinear interpolation.
        :param int *              grid_l: length of grids (axes)
        :param const DTYPE * comp:   pointer to component values
        :param int *              ind:    array of indices on grids
        :param DTYPE *       fac:    factors along idnividual axes

    """
    cdef DTYPE c00, c01, c10, c11, c0, c1, cf
    cdef int zy   = grid_l[1] * grid_l[2]
    cdef int zyx0 = zy * ind[0]
    cdef int zyx1 = zy * (ind[0] + 1)
    cdef int zy0  = grid_l[2] * ind[1]
    cdef int zy1  = grid_l[2] * (ind[1] + 1)

    c00 = comp[zyx0 + zy0 + ind[2]]     * (1.0 - fac[0]) + comp[zyx1 + zy0 + ind[2]]     * fac[0]
    c01 = comp[zyx0 + zy0 + ind[2] + 1] * (1.0 - fac[0]) + comp[zyx1 + zy0 + ind[2] + 1] * fac[0]
    c10 = comp[zyx0 + zy1 + ind[2]]     * (1.0 - fac[0]) + comp[zyx1 + zy1 + ind[2]]     * fac[0]
    c11 = comp[zyx0 + zy1 + ind[2] + 1] * (1.0 - fac[0]) + comp[zyx1 + zy1 + ind[2] + 1] * fac[0]
    c0 = c00 * (1.0 - fac[1]) + c10 * fac[1]
    c1 = c01 * (1.0 - fac[1]) + c11 * fac[1]
    cf = c0  * (1.0 - fac[2]) + c1  * fac[2]
    return cf

    #cdef DTYPE c0, c1, c2, c3, c4, c5, c6, c7
    #print('\n')
    #print((((1.0 - fac[0]) * (1.0 - fac[1])) * (1.0 - fac[2])))
    #print(((       fac[0]  * (1.0 - fac[1])) * (1.0 - fac[2])))
    #print((((1.0 - fac[0]) * (1.0 - fac[1])) *        fac[2]) )
    #print(((       fac[0]  * (1.0 - fac[1])) *        fac[2]) )
    #print((((1.0 - fac[0]) *        fac[1] ) * (1.0 - fac[2])))
    #print(((       fac[0]  *        fac[1] ) * (1.0 - fac[2])))
    #print((((1.0 - fac[0]) *        fac[1] ) *        fac[2]) )
    #print(((       fac[0]  *        fac[1] ) *        fac[2]) )
    #print('\n')
    #c0 = comp[zyx0 + zy0 + ind[2]]     * (((1.0 - fac[0]) * (1.0 - fac[1])) * (1.0 - fac[2]))
    #c1 = comp[zyx1 + zy0 + ind[2]]     * ((       fac[0]  * (1.0 - fac[1])) * (1.0 - fac[2]))
    #c2 = comp[zyx0 + zy0 + ind[2] + 1] * (((1.0 - fac[0]) * (1.0 - fac[1])) *        fac[2]) 
    #c3 = comp[zyx1 + zy0 + ind[2] + 1] * ((       fac[0]  * (1.0 - fac[1])) *        fac[2]) 
    #c4 = comp[zyx0 + zy1 + ind[2]]     * (((1.0 - fac[0]) *        fac[1] ) * (1.0 - fac[2]))
    #c5 = comp[zyx1 + zy1 + ind[2]]     * ((       fac[0]  *        fac[1] ) * (1.0 - fac[2]))
    #c6 = comp[zyx0 + zy1 + ind[2] + 1] * (((1.0 - fac[0]) *        fac[1] ) *        fac[2]) 
    #c7 = comp[zyx1 + zy1 + ind[2] + 1] * ((       fac[0]  *        fac[1] ) *        fac[2]) 
    #return c0 + c1 + c2 + c3 + c4 + c5 + c6 + c7


cdef int nd_interpolate(int dim_l, int com_l, const DTYPE ** grid, int * grid_l, const DTYPE ** comp, DTYPE * points, int points_l,  DTYPE * output):
    """
    Cython implementation of multidimensional interpolation.
    Currently implemented only for trilinear interpolation.
        :param int                 dim_l:    number of dimensions
        :param int                 com_l:    number of components
        :param const DTYPE ** grid:     array of grids
        :param int *               grid_l:   array of grid lengths
        :param const DTYPE ** comp:     array of component values
        :param DTYPE *        points:   array of points
        :param int                 points_l: number of points to interpolate
        :param DTYPE *        output:   pointer to output array

    """

    cdef int coe_l = dim_l ** 2 - 1    
    cdef DTYPE * val = <DTYPE *> malloc(dim_l * sizeof(DTYPE))
    cdef int        * ind = <int *>        malloc(dim_l * sizeof(int))
    cdef DTYPE * fac = <DTYPE *> malloc(dim_l * sizeof(DTYPE))
    cdef DTYPE p
    cdef int i, d, c, outside

    ### iterate over points
    for i in range(points_l): #here points
        outside = 0
        ### locate index in grid
        for d in range(dim_l):
            p = points[i * 3 + d]
            outside += indices(grid[d], grid_l[d], p, &fac[d], &ind[d])

        ### perform interpolation
        if dim_l == 3:
            for c in range(com_l):
                if outside:
                    output[i * 3 + c] = 0
                else:
                    output[i * 3 + c] = n3_interpolate(grid_l, comp[c], ind, fac)
        else:
            return 1

    free(val)
    free(ind)
    free(fac)

    return 0


cdef DTYPE * co_interpolate(CData * data, DTYPE * points, int points_l, DTYPE * output):
    """
    Cython wrapper for nd_interpolate.
    Returns DTYPE pointer.
        
        :param Data         data:     datastructure to perform interpolation on
        :param DTYPE * points:   pointer to the beginning of the numpy array
        :param int          points_l: number of points to interpolate 
        :param DTYPE * output:   allocated output array
    """

    cdef int dim_l = deref(data).dim_l
    cdef int com_l = deref(data).com_l
    cdef int * grid_l = deref(data).grid_l
    cdef const DTYPE ** grid = deref(data).grid
    cdef const DTYPE ** comp = deref(data).comp
    
    cdef int a = nd_interpolate(dim_l, com_l, grid, grid_l, comp, points, points_l, output)

    if a == 1:
        free(output)
        return NULL

    return output


cdef DTYPE * c_interpolate(CData * data, DTYPE * points, int points_l):
    """
    Cython wrapper for nd_interpolate.
    Returns DTYPE pointer.
        
        :param Data         data:     datastructure to perform interpolation on
        :param DTYPE * points:   pointer to the beginning of the numpy array
        :param int          points_l: number of points to interpolate 
    """

    cdef DTYPE * output = <DTYPE *> malloc(points_l * deref(data).com_l * sizeof(DTYPE))
    return co_interpolate(data, points, points_l, output)



cdef pointer_to_numpy_array(void * ptr, np.npy_intp * size):
    """
    Creates np.ndarray by encapsulating DTYPE * pointer.
        
        :param void *        ptr:  DTYPE pointer pointing to beginning
        :param np.npy_intp * size: pointer to 2D array containg info:   
            size[0] - number of points 
            size[1] - components per point
    """

    cdef np.ndarray[DTYPE, ndim=2] arr = np.PyArray_SimpleNewFromData(2, size, np.NPY_DOUBLE, ptr)
    PyArray_ENABLEFLAGS(arr, np.NPY_ARRAY_OWNDATA)
    return arr


def interpolate(Data data, DTYPE[:,::1] points):
    """
    Performs interpolation on supplied data structure.
    Returns np.ndarray with shape (N, comp) where comp 
    is numer of components.
        
        :param Data              data:   datastructure to perform interpolation on
        :param DTYPE[:,::1] points: np.ndarray with shape (N, dim) where dim is numer of dimensions
    """

    cdef DTYPE * a = c_interpolate(data.c, &points[0, 0], points.shape[0])
    cdef np.npy_intp dims[2]

    if a == NULL:
        raise Exception('Interpolation on requested dimensions not implemented.')
    
    dims[0] = points.shape[0]
    dims[1] = data.c.com_l
    arr = pointer_to_numpy_array(a, dims)
    return arr
