#import numpy as np
from math import isclose

from numflow.kernels import dataset_kernel

tolrance = 10e-5

field = dataset_kernel("tests/testdata/rectilinear.csv")
assert field != None
x = field.x_coords()
assert type(x) is memoryview
assert isclose(x[0], 0.10, rel_tol=tolrance)
assert isclose(x[-1], 60.0, rel_tol=tolrance)
y = field.y_coords()
assert type(y) is memoryview
assert isclose(y[0], 0.10, rel_tol=tolrance)
assert isclose(y[-1], 60.0, rel_tol=tolrance)
z = field.z_coords()
assert type(z) is memoryview
assert isclose(z[0], -20.00, rel_tol=tolrance)
assert isclose(z[-1], 0.50, rel_tol=tolrance)