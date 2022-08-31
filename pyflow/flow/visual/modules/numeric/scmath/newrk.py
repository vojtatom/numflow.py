import numpy as np
from . import checks
import timeit
import math

SAFETY = 0.9 # Multiply steps computed from asymptotic behaviour of errors by this.

MIN_FACTOR = 0.2  # Minimum allowed decrease in a step size.
MAX_FACTOR = 10  # Maximum allowed increase in a step size.

A = [np.array([1/5]),
    np.array([3/40, 9/40]),
    np.array([44/45, -56/15, 32/9]),
    np.array([19372/6561, -25360/2187, 64448/6561, -212/729]),
    np.array([9017/3168, -355/33, 46732/5247, 49/176, -5103/18656])]
B = np.array([35/384, 0, 500/1113, 125/192, -2187/6784, 11/84])
C = np.array([1/5, 3/10, 4/5, 8/9, 1])
E = np.array([-71/57600, 0, 71/16695, -71/1920, 17253/339200, -22/525, 1/40])


def norm(x):
    return np.linalg.norm(x) / x.size ** 0.5


def select_initial_step(fun, t0, y0, f0, direction, order, rtol, atol):
    scale = atol + np.abs(y0) * rtol
    
    d0 = norm(y0 / scale)
    d1 = norm(f0 / scale)

    if d0 < 1e-5 or d1 < 1e-5:
        h0 = 1e-6
    else:
        h0 = 0.01 * d0 / d1

    y1 = y0 + h0 * direction * f0
    f1 = fun(t0 + h0 * direction, y1)
    d2 = norm((f1 - f0) / scale) / h0

    if d1 <= 1e-15 and d2 <= 1e-15:
        h1 = max(1e-6, h0 * 1e-3)
    else:
        h1 = (0.01 / max(d1, d2)) ** (1 / (order + 1))

    return min(100 * h0, h1)


def rk_step(fun, t, y, f, h, K):
    #print("t:", t, "y:", y, "f:", f, "h:", h)
    K[0] = f
    for s, (a, c) in enumerate(zip(A, C)):
        dy = np.dot(K[:s + 1].T, a) * h
        #print("    at:", y + dy)
        K[s + 1] = fun(t + c * h, y + dy)

    y_new = y + h * np.dot(K[:-1].T, B)
    #print('new y:', y_new)
    f_new = fun(t + h, y_new)
    #print('new f:', f_new)

    K[-1] = f_new
    error = np.dot(K.T, E) * h
    #print('error:', error)
    return y_new, f_new, error


class RKSolver:
    order = 4
    n_stages = 6

    def __init__(self, fun, t0, y0, t_bound, max_step=np.inf, rtol=1e-3, atol=1e-6):
        self.y, self.rtol = checks.rk_check(fun, t0, y0, t_bound, max_step, rtol, atol)
        self.y_old = None
        self.t = t0
        self.t_bound = t_bound
        self.fun = fun
        self.max_step = max_step
        self.atol = atol
        self.n = self.y.size
        self.direction = np.sign(t_bound - t0) if t_bound != t0 else 1
        self.status = 'running'
        self.f = self.fun(self.t, self.y)
        self.h_abs = select_initial_step(self.fun, self.t, self.y, self.f, self.direction, self.order, self.rtol, self.atol)
        self.K = np.empty((self.n_stages + 1, self.n), dtype=self.y.dtype)
        

    @property
    def step_size(self):
        if self.t_old is None:
            return None
        else:
            return np.abs(self.t - self.t_old)


    def step(self):
        if self.status != 'running':
            raise RuntimeError("Attempt to step on a failed or finished solver.")

        if self.t == self.t_bound:
            # Handle corner cases of empty solver or no integration.
            self.t_old = self.t
            self.t = self.t_bound
            self.status = 'finished'
        else:
            t = self.t
            success = self._step_impl()
            if not success:
                self.status = 'failed'
            else:
                self.t_old = t
                if self.direction * (self.t - self.t_bound) >= 0:
                    self.status = 'finished'



    def _step_impl(self):
        t = self.t
        y = self.y

        max_step = self.max_step
        rtol = self.rtol
        atol = self.atol

        min_step = 10 * np.abs(np.nextafter(t, self.direction * np.inf) - t)
        #print('min step: {:.32E}'.format(min_step))
        
        if self.h_abs > max_step:
            h_abs = max_step
        elif self.h_abs < min_step:
            h_abs = min_step
        else:
            h_abs = self.h_abs

        order = self.order
        step_accepted = False

        while not step_accepted:
            if h_abs < min_step:
                return False

            h = h_abs * self.direction
            t_new = t + h

            if self.direction * (t_new - self.t_bound) > 0:
                t_new = self.t_bound

            h = t_new - t
            h_abs = np.abs(h)

            y_new, f_new, error = rk_step(self.fun, t, y, self.f, h, self.K)
            scale = atol + np.maximum(np.abs(y), np.abs(y_new)) * rtol
            error_norm = norm(error / scale)

            if error_norm == 0.0:
                h_abs *= MAX_FACTOR
                step_accepted = True
            elif error_norm < 1:
                h_abs *= min(MAX_FACTOR, max(1, SAFETY * math.pow(error_norm, (-1 / (order + 1)))))
                step_accepted = True
            else:
                #print('err :', error_norm)
                h_abs *= max(MIN_FACTOR, SAFETY *  math.pow(error_norm, (-1 / (order + 1))))

            
            #elif error_norm < 1:
            #    h_abs *= min(MAX_FACTOR, max(1, SAFETY * error_norm ** (-1 / (order + 1))))
            #    step_accepted = True
            #else:
            #    print('err :', error_norm)
            #    h_abs *= max(MIN_FACTOR, SAFETY * error_norm ** (-1 / (order + 1)))

        self.y_old = y
        self.t = t_new
        self.y = y_new
        self.h_abs = h_abs
        self.f = f_new
        return True
