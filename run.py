#user written script/script to run the application
##import numpy as np
##from scipy.interpolate import RegularGridInterpolator
##
##x = np.array([1, 1.5, 2])
##y = np.array([1, 1.5, 2, 2.5])
##z = np.array([1, 1.5, 2, 2.5])
##
##axis = (x, y, z)
##
###array 3 x 4 x 4 x 3
##values = np.random.rand(3, 4, 4, 3)
##
##print(axis)
##print(values)
##interpolator = RegularGridInterpolator(axis, values)
##
##print(interpolator([1.5, 1.8, 1.6]))

#from numflow import load
#
#cdata, sdata = load("data.csv", mode="both")
#print(sdata([[0.10,3.15,-10.29]]))
#
#
##trojice hodnot - pozice 3D
##trojce hodnot - směr 3D
#
#
#[xyz], [xyz], [xyz], [xyz], [xyz], [xyz] pozice
#[abc], [abc], [abc], [abc], [abc], [abc] smery
#
#
#buffer pozic -> [xyzxyzxyzxyzxyzxyz ...
#buffer smery -> [abc ...
#
#buffer geometrii cone -> [troju troju ... ]



from numflow import load
from scipy.interpolate import RegularGridInterpolator
import numpy as np

#interpc, interps = load("test.csv", mode="both")
#interpc, interps = load("tmp.npy", mode="both")
interps = load("el1_512_512_512.csv", mode="c")

points = [[20, 20, -10]]
#points = [[0.1, 1.12, -20]]
#print(interpc)
print(interps)
#print(interpc(points))
print(interps(points))

