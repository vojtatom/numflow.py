# cython: language_level=3, boundscheck=False

from libc.stdlib cimport malloc, free
cimport numpy as np
from cython.operator cimport dereference as deref
from ..types cimport DTYPE

import cython
import numpy as np

np.import_array()


cdef class Data: 

    def __init__(self, int com, int dim):
        self.c = <CData *> malloc(sizeof(CData))
        self.c.grid = <const DTYPE **> malloc(dim * sizeof(const DTYPE *))
        self.c.comp = <const DTYPE **> malloc(com * sizeof(const DTYPE *))
        self.c.grid_l = <int *> malloc(dim * sizeof(int))
        self.c.dim_l = dim
        self.c.com_l = com
        
        self.np_grid = []
        self.np_comp = []
        self.grid_alloc = 0
        self.comp_alloc = 0


    def __dealloc__(self):
        free(self.c.grid)
        free(self.c.comp)
        free(self.c.grid_l)
        free(self.c)


    def add_component3(self, const DTYPE[:,:,::1] c):
        self.np_comp.append(c)
        cdef int i = self._component(&c[0, 0, 0])

        if i < 0:
            raise Exception('Invalid operation while adding a component.')


    def add_grid(self, const DTYPE[::1] g):
        self.np_grid.append(g)
        cdef int i = self._grid(&g[0], g.shape[0])

        if i < 0:
            raise Exception('Invalid operation while adding a grid.')

    @property
    def grid_min(self):
        values = []
        for d in range(self.c.dim_l):
            values.append(self.c.grid[d][0])
        
        return np.array(values)


    @property
    def grid_max(self):
        values = []
        for d in range(self.c.dim_l):
            values.append(self.c.grid[d][self.c.grid_l[d] - 1])
        return np.array(values)


    @property
    def com_l(self):
        return self.c.com_l


    @property
    def dim_l(self):
        return self.c.dim_l
    

    cdef int _grid(self, const DTYPE * g, int grid_l):
        if self.grid_alloc == self.c.dim_l:
            return -1
        
        self.c.grid[self.grid_alloc] = g
        self.c.grid_l[self.grid_alloc] = grid_l
        self.grid_alloc += 1
        return 0


    cdef int _component(self, const DTYPE * c):
        if self.comp_alloc == self.c.com_l:
            return -1

        self.c.comp[self.comp_alloc] = c
        self.comp_alloc += 1
        return 0


