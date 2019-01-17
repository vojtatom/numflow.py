from visual.modules.numeric.math import cstreamlines, sstreamlines
from visual.modules.numeric.io import cdata

from visual.modules.numeric.scmath.py_ivp import solve_ivp
import numpy as np
import sys

from memory_profiler import profile
from timeit import Timer

@profile
def main():
    data = cdata('example2.fits')
    print('data loaded')
    sys.stdout.flush()
    #points = np.array([[10.0, 10.0, 5.0],])
    points = np.array([[30.0, 30.0, -10.0],]) * (10 ** 6)

    def benchmarkA():
        #positions, values, lengths = integrate.solve_ivp(data, 0.0, 2000000.0, points)
        cstreamlines(data, 0.0, 2000000.0, points)
    
    time = Timer(benchmarkA).timeit(100)
    print(time)

    def interpolate(t, y):
        return data.interpolate(np.array([y,]))[0]

    def benchmarkB():
        solve_ivp(interpolate, [0.0, 2000000.0], points)

    time = Timer(benchmarkB).timeit(100)
    print(time)

#main()

data = cdata('example2.fits')
print('data loaded')
points = np.array([[30.0, 30.0, -10.0],]) * (10 ** 6)
result = cstreamlines(data, 0.0, 2000000.0, points)
print(result)