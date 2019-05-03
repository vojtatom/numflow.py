import visual.modules.numeric.data as data
import visual.modules.numeric.math as numeric
import numpy as np
import timeit

from pprint import pprint

from scipy.interpolate import RegularGridInterpolator
from scipy.integrate import solve_ivp


def ccreate(axis, d):
    # c interpolator
    cdata = data.CData(3, 3)
    cdata.add_grid(axis[0])
    cdata.add_grid(axis[1])
    cdata.add_grid(axis[2])
    cdata.add_component3(d[0])
    cdata.add_component3(d[1])
    cdata.add_component3(d[2])
    return cdata.interpolator, cdata


def screate(axis, d):
    # scipy interpolator
    arrays = np.stack(d, axis=-1).astype(np.double)
    interp = RegularGridInterpolator(axis, arrays, fill_value=[0, 0, 0], bounds_error=False)
    return interp, data.SData(interp, 0, 0, 0, 0)


def test_accuracy():
    # points
    # text for closseness od results
    points = np.random.rand(1000000, 3) * size
    c_points = c_interpolator(points)
    s_points = s_interpolator(points)
    print(np.allclose(c_points, s_points))


def test_interpoltaion(filename):
    # test times
    def cinterp():
        c_interpolator(points)

    def sinterp():
        s_interpolator(points)

    times = {}
    numpoints = [1, 10, 100, 1000, 10000, 100000, 1000000]
    repetitions = [1, 10, 100, 1000, 10000, 100000, 1000000]

    with open(filename, 'w') as file:

        for num in numpoints:
            for rep in repetitions:
                if num * rep > 1000000:
                    continue
                
                points = np.random.rand(num, 3) * size
                print("num points: {}, repetitions {}".format(num, rep))
                ctime = timeit.timeit(cinterp, number=rep)
                stime = timeit.timeit(sinterp, number=rep)
                ratio = stime / ctime

                print("ctime: {0:.5f}, stime {1:.5f}, ratio {2:.5f}".format(ctime, stime, ratio))
                file.write("num points: {}, repetitions {}\n".format(num, rep))
                file.write("ctime: {0:.5f}, stime {1:.5f}, ratio {2:.5f}\n\n".format(ctime, stime, ratio))
                times[(num, rep)] = [ctime, stime, ratio]

    print("finished")
    print(times)


class FakeAbort:
    def __init__(self):
        pass
    
    def is_set(self):
        return False


def test_integrations(filename):
    # test times
    fa = FakeAbort()

    def cintegr():
        numeric.cstreamlines(cdata, t0, tbound, points)
        #pprint(a[0])

    def sintegr():
        numeric.sstreamlines(sdata, t0, tbound, points, fa)
        #pprint(a[0])

    times = {}
    numpoints = [1, 10, 100, 1000, 10000, 100000]
    repetitions = [1, 10, 100]

    with open(filename, 'w') as file:
        for num in numpoints:
            for rep in repetitions:
                if num * rep > 10000:
                    print("skipping {}".format(rep))
                    continue
                        
                points = np.random.rand(num, 3) * size
                print("num points: {}, repetitions {}".format(num, rep))
                ctime = timeit.timeit(cintegr, number=rep)
                stime = timeit.timeit(sintegr, number=rep)
                ratio = stime / ctime

                print("ctime: {0:.5f}, stime {1:.5f}, ratio {2:.5f}".format(ctime, stime, ratio))
                file.write("num points: {}, repetitions {}\n".format(num, rep))
                file.write("ctime: {0:.5f}, stime {1:.5f}, ratio {2:.5f}\n\n".format(ctime, stime, ratio))
                times[(num, rep)] = [ctime, stime, ratio]

    print("finished")
    print(times)


### setup
shape = (200, 200, 200)
size = (600, 600, 50)
magnitude = (100, 100, 100)
t0 = 0
tbound = 100

### complete random dataset
x = np.random.rand(*shape) * magnitude[0]
x_axis = np.sort(np.random.rand(shape[0])) * size[0]
y = np.random.rand(*shape) * magnitude[1]
y_axis = np.sort(np.random.rand(shape[1])) * size[1]
z = np.random.rand(*shape) * magnitude[2]
z_axis = np.sort(np.random.rand(shape[2])) * size[2]


c_interpolator, cdata = ccreate([x_axis, y_axis, z_axis], [x, y, z])
s_interpolator, sdata = screate([x_axis, y_axis, z_axis], [x, y, z])

#test_interpoltaion('interpolation_random.txt')
#test_integrations('integration_random.txt')

del x_axis, y_axis, z_axis, c_interpolator, s_interpolator


x_axis = np.arange(shape[0]).astype(np.double) * (size[0] / shape[0])
y_axis = np.arange(shape[1]).astype(np.double) * (size[1] / shape[1])
z_axis = np.arange(shape[2]).astype(np.double) * (size[2] / shape[2])

c_interpolator, cdata = ccreate([x_axis, y_axis, z_axis], [x, y, z])
s_interpolator, sdata = screate([x_axis, y_axis, z_axis], [x, y, z])

#test_interpoltaion('interpolation_regular.txt')
test_integrations('integration_regular.txt')



