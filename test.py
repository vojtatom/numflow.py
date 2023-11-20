#import numpy as np
from math import isclose

from numflow import Dataset, Visualization, points, random_points

field = Dataset("tests/testdata/rectilinear.csv")
print(field.info())
vis = Visualization()
#Dataset: tests/testdata/rectilinear.csv
#Size: 72000 elements
#Shape: 60 x 60 x 20
#Memory consumed: 288000 bytes
#X range: 0.100000 - 60.000000
#Y range: 0.100000 - 60.000000
#Z range: -20.000000 - 0.500000
#layer = points([0, 0, -10], [60, 60, -10], [100, 100, 1])
#vis.layer(field, layer)
#volume = points([0, 0, -20], [60, 60, 0.5], [100, 100, 100])
#vis.glphys(field, volume, size=0.1)
#volume = random_points([0, 0, -20], [60, 60, 0.5], 1000000)
#vis.glphys(field, volume, size=0.1)

#volume = random_points([0, 0, -20], [60, 60, 0.5], 100)
#vis.streamlines(field, volume, tbound=0.05)
#vis.save("out.flow")
