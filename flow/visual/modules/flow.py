import timeit

import numpy as np
from scipy.integrate import solve_ivp
from memory_profiler import profile

from numeric.io import cdata, data
from numeric.kernels import PointsKernel

from numeric.cmath import interpolate

from numeric.math.py_ivp import solve_ivp as my_solve_ivp
from numeric.cmath import solve_ivp as csolve_ivp

#@profile
def main():
    d, minim, maxim = data('test4.fits')
    cd = cdata('test4.fits')

    pk = PointsKernel()
    pk.data(d, minim, maxim)
    pk.cdata = cd

    print("performing calculation")
    #a = pk.calculate()
    #b = pk.calculate(cmode=False)
    #print(np.allclose(a, b, atol=0, rtol=1e-10))
    #print(a.size - np.count_nonzero(a == b), "/", a.size)
    pk.benchmark()

#@profile
def main2():
    d, minim, maxim = data('test4.fits')
    cd = cdata('test4.fits')

    def boundry(t, y):
        return np.prod((y - minim) * (maxim - y))     
    boundry.terminal = True

    def interp(t, y):
        return d(y)

    def cinterp(t, y):
        return interpolate(cd, np.array([y,]))[0]

    def solve():
        solve_ivp(interp, [0, 1000], [50, 50, -50])

    def solve_event():
        solve_ivp(cinterp, [0, 1000], [50, 50, -50]) #events=boundry


    time = timeit.Timer(solve).timeit(10)
    time_bound = timeit.Timer(solve_event).timeit(10)
    print(time, time_bound)

    #a = solve_ivp(cinterp, [0, 100], [100, 100, -100])
    b = solve_ivp(interp, [0, 100], [100, 100, -100])
    #print(a.y)
    print(np.asarray(b.y, dtype=np.float))
    print("diffs ===================================")
    #print(a.y[:, :300] - b.y[:, :300])

    c = my_solve_ivp(interp, [0, 100], np.array([[100, 100, -100]]))
    #print(c)

    print(np.allclose(np.asarray(b.y, dtype=np.float), c))


def main3():
    np.set_printoptions(precision=20, floatmode='fixed')
    d, *_ = data('test4.fits')
    cd = cdata('test4.fits') 

    point = np.array([51.456, 50.4564, -52.456], dtype=np.float)
    #point = np.array([51.78964, 51.4564, -52.75567], dtype=np.float)
    a = d(point)
    b = interpolate(cd, np.array([point,]))
    print(a)
    print(b)
    print(a - b)


def main4():
    np.set_printoptions(precision=14, floatmode='fixed')
    d, minim, maxim = data('test4.fits')
    cd = cdata('test4.fits')

    def interp(t, y):
        return d(y)

    def cinterp(t, y):
        return interpolate(cd, np.array([y,]))[0]

    point = [300, 300, -100]

    def solveC():
        solve_ivp(cinterp, [0, 5], point)

    def solveA():
        my_solve_ivp(interp, [0, 5], np.array([point]))

    def solveB():
        csolve_ivp(cd, 0, 5, np.array([point], dtype=np.float))

    timeC = timeit.Timer(solveC).timeit(100)
    timeA = timeit.Timer(solveA).timeit(100)
    timeB = timeit.Timer(solveB).timeit(100)
    print("times:", timeC, timeA, timeB)
    c = my_solve_ivp(cinterp, [0, 5], np.array([point]))
    d = csolve_ivp(cd, 0, 5, np.array([point], dtype=np.float))

main4()
