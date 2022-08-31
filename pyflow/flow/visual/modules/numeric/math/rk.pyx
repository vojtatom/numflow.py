# cython: language_level=3, boundscheck=False, wraparound=False, nonecheck=False, cdivision=True

from libc.stdlib cimport malloc, realloc, free
from libc.math cimport fabs, fmax, fmin, pow
cimport numpy as np
cimport cython
from ..types cimport DTYPE, LONGDTYPE

from ..data.cdata cimport CSData
from .interpolate cimport co_interpolate
from .common cimport norm, div

### Matrices for 4th order RK step
cdef DTYPE * A = [1.0 / 5.0, 0.0, 0.0, 0.0, 0.0,
                  3.0 / 40.0, 9.0 / 40.0, 0.0, 0.0, 0.0,
                  44.0 / 45.0, -(56.0 / 15.0), 32.0 / 9.0, 0.0, 0.0,
                  19372.0 / 6561.0, -(25360.0 / 2187.0), 64448.0 / 6561.0, -(212.0 / 729.0), 0.0,
                  9017.0 / 3168.0, -(355.0 / 33.0), 46732.0 / 5247.0, 49.0 / 176.0, -(5103.0 / 18656.0)]

cdef DTYPE * B = [35.0 / 384.0, 0.0, 500.0 / 1113.0, 125.0 / 192.0, -(2187.0 / 6784.0), 11.0 / 84.0]
cdef DTYPE * C = [1.0 / 5.0, 3.0 / 10.0, 4.0 / 5.0, 8.0 / 9.0, 1.0]
cdef DTYPE * E = [-(71.0 / 57600.0), 0.0, 71.0 / 16695.0, -(71.0 / 1920.0), 17253.0 / 339200.0, -(22.0 / 525.0), 1.0 / 40.0]

### Constants
cdef DTYPE SAFETY = 0.9 # Multiply steps computed from asymptotic behaviour of errors by this.
cdef DTYPE MIN_FACTOR = 0.2  # Minimum allowed decrease in a step size.
cdef DTYPE MAX_FACTOR = 10  # Maximum allowed increase in a step size.


#cdef DTYPE dot(DTYPE * vec_a, DTYPE * vec_b, int vec_l, int stride_a, int stride_b):
#    cdef LONGDTYPE d = 0.0, a, b
#    cdef int i
#    for i in range(vec_l):
#        a = vec_a[i * stride_a]
#        b = vec_b[i * stride_b]
#        d += a * b
#    return d

cdef DTYPE dot(DTYPE * vec_a, DTYPE * vec_b, int vec_l, int stride_a, int stride_b):
    cdef DTYPE d = 0.0, a, b
    cdef int i
    for i in range(vec_l):
        a = vec_a[i * stride_a]
        b = vec_b[i * stride_b]
        d += a * b
    return d


cdef class RKSolver:
    """
    Custom Runge-Kutta fourt and fifth order solver
    Requires number of compenents to be equal to number of dimensions
    or number of dimensions plus one. 

    TODO - implement interpolation using specialized function allowing 
    passing of time argument
    """

    def __init__(self):
        """
        Create uninitialized solver.
        """
        self.initialized = 0


    def __dealloc__(self):
        """
        Clean up after yourself!
        """
        if self.initialized:
            free(self.y)
            free(self.f)
            free(self.yt)
            free(self.ft)
            free(self.y1)
            free(self.f1)
            free(self.sc)
            free(self.er)
            free(self.K)


    cdef void create(self, CSData * cdata, DTYPE t0, DTYPE t_bound):
        """
        Create a solver class.
            :param CSData cdata: cdata struct containing info
            :param DTYPE t0: initial integration time
            :param DTYPE t_bound: maximal integration time
        """
        self.initialized = 1
        self.cdata = cdata
        self.order = 4
        self.n_stages = 6
        self.atol = 1e-6
        self.rtol = 1e-3
        self.status = Status.ready
        self.t0 = t0
        self.t = t0
        self.t_bound = t_bound
        self.direction = 1 if t_bound - t0 > 0 else -1
        self.y =  <DTYPE *>malloc(self.cdata.com_l * sizeof(DTYPE))
        self.f =  <DTYPE *>malloc(self.cdata.com_l * sizeof(DTYPE))
        self.yt = <DTYPE *>malloc(self.cdata.com_l * sizeof(DTYPE))
        self.ft = <DTYPE *>malloc(self.cdata.com_l * sizeof(DTYPE))
        self.y1 = <DTYPE *>malloc(self.cdata.com_l * sizeof(DTYPE))
        self.f1 = <DTYPE *>malloc(self.cdata.com_l * sizeof(DTYPE))
        self.sc = <DTYPE *>malloc(self.cdata.com_l * sizeof(DTYPE))
        self.er = <DTYPE *>malloc(self.cdata.com_l * sizeof(DTYPE))
        self.K  = <DTYPE *>malloc(self.cdata.com_l * (self.n_stages + 1) * sizeof(DTYPE))

        #print('system init')
        #sys.stdout.flush()


    cdef void initial_step(self, DTYPE * y0):
        """
        Initial step of integration, sets up internal variables
        and selects initial step value. In case solver was used previously,
        restarts time and status.

            :param DTYPE * y0: starting spatial point 
        """
    
        cdef DTYPE d0, d1, d2, h0
        cdef int c

        ##restarting, just to make sure
        self.t = self.t0
        self.status = Status.ready

        ### TODO - replace with time interpolation, value t0 (t)
        co_interpolate(self.cdata, y0, 1, self.f)           

        ### scaling
        for c in range(self.cdata.com_l):
            self.y[c] = y0[c]
            self.sc[c] = self.atol + fabs(self.y[c]) * self.rtol
            self.yt[c] = div(self.y[c], self.sc[c])
            self.ft[c] = div(self.f[c], self.sc[c])

        d0 = norm(self.yt, self.cdata.com_l)
        d1 = norm(self.ft, self.cdata.com_l)

        if d0 < 1e-5 or d1 < 1e-5:
            h0 = 1e-6
        else:
            h0 = 0.01 * div(d0, d1) 

        for c in range(self.cdata.com_l):
            self.y1[c] = self.y[c] + h0 * self.direction * self.f[c]

        ### TODO - replace with time interpolation, value = t0 + h0 * direction
        co_interpolate(self.cdata, self.y1, 1, self.f1)

        for c in range(self.cdata.com_l):
            self.ft[c] = div((self.f1[c] - self.f[c]), self.sc[c])
        
        d2 = div(norm(self.ft, self.cdata.com_l), h0)
        
        if d1 <= 1e-15 and d2 <= 1e-15:
            h1 = fmax(1e-6, h0 * 1e-3)
        else:
            h1 = pow(div(0.01, fmax(d1, d2)), div(1.0, self.order + 1))

        self.h_abs = fmin(100 * h0, h1)

        #print('init step done')
        #sys.stdout.flush()


    cdef void step(self):
        """
        Perform one step. Updates internal values.
        """
        cdef int c

        ### initial checks
        if self.initialized != 1:
            self.status = Status.failed
            return 
        
        if self.status == Status.finished or self.status == Status.failed:
            return

        ### declaring all necessary
        cdef DTYPE t_new
        cdef DTYPE min_step = 10.0 * (nextafter(self.t, self.t_bound) - self.t)
        cdef DTYPE h_abs = self.h_abs   # absolute dt
        cdef DTYPE h = 0                # actualy is dt
        cdef int accepted = 0

        ### if dt is smaller than minimal step
        ### max_step is infinity so no need to check if h_abs is higher
        if h_abs < min_step:
            h_abs = min_step
        
        while not accepted:
            if h_abs < min_step:
                self.status = Status.failed
                return

            ### h is now real dt with accurate directin
            h = h_abs * self.direction
            t_new = self.t + h

            ### check for bounds and update h (dt)
            if (t_new - self.t_bound) * self.direction > 0:
                t_new = self.t_bound
            
            h = t_new - self.t
            h_abs = fabs(h)

            ### perform step, error is implemented inside
            self.rk_step(h)
            ### y_new -> self.y1, f_new -> self.f1, err_nrm -> self.ern

            if self.ern == 0.0:
                h_abs *= MAX_FACTOR
                accepted = 1   
            elif self.ern < 1:
                h_abs *= fmin(MAX_FACTOR, fmax(1.0, SAFETY * pow(self.ern, -(1.0 / (self.order + 1.0)))))
                accepted = 1         
            else:
                h_abs *= fmax(MIN_FACTOR, SAFETY * pow(self.ern, -(1.0 / (self.order + 1.0))))

        self.t = t_new
        self.h_abs = h_abs
        for c in range(self.cdata.com_l):
            self.y[c] = self.y1[c]
            self.f[c] = self.f1[c]

        ### check for finish
        if self.direction * (self.t - self.t_bound) >= 0:
            self.status = Status.finished


    cdef void rk_step(self, DTYPE h):
        """
        Low level implementation of single
        Runge-Kutta step.

        Significant calculated values:
            self.y1  - new position (vector)
            self.f1  - new function value (vector)
            self.er  - error rate (vector)
            self.ern - norm from error rate (value)
        """
        cdef int i, j, c
        cdef DTYPE tmp = 0.0

        ### prepare K matrix and init y1 (new_y)
        for c in range(self.cdata.com_l):
            self.K[0 * self.cdata.com_l + c] = self.f[c]
            self.y1[c] = 0
            self.er[c] = 0

        ### 5 as constant size of A and C
        for i in range(5):
            ### for each component
            for c in range(self.cdata.com_l):
                ### Dot product with transposed K,
                ### transposition is done using strides
                tmp = dot(&A[i * 5], &self.K[c], i + 1, 1, self.cdata.com_l)
                self.yt[c] = tmp * h + self.y[c]
            ### TODO - time interpolation, value = t + c[i] * h
            co_interpolate(self.cdata, self.yt, 1, &self.K[(i + 1) * self.cdata.com_l])

        ## dotproduct with B, adding the rest from above
        for c in range(self.cdata.com_l):
            self.y1[c] = self.y[c] + h * dot(&self.K[c], B, 6, self.cdata.com_l, 1)

        ### TODO - time interpolation, value = t + h
        ### f1 will be in K on 6th row
        co_interpolate(self.cdata, self.y1, 1, &self.K[6 * self.cdata.com_l])

        ### calculate vector error
        for c in range(self.cdata.com_l):
            self.er[c] = dot(&self.K[c], E, 7, self.cdata.com_l, 1)

        for c in range(self.cdata.com_l):
            ### scale error vector and copy f1 from K
            self.er[c] *= h
            self.f1[c] = self.K[6 * self.cdata.com_l + c]
            ### scaling
            self.sc[c] = self.atol + fmax(fabs(self.y[c]), fabs(self.y1[c])) * self.rtol
            self.er[c] = div(self.er[c], self.sc[c])

        ### calculate norm of error
        self.ern = norm(self.er, self.cdata.com_l)


