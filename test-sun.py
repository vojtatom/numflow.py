#import numpy as np
from math import isclose

from numflow import Dataset, Visualization, points, random_points

field = Dataset("tests/testdata/sun.csv")
print(field.info())
vis = Visualization()
#Dataset: tests/testdata/sun.csv
#Size: 74160000 elements
#Shape: 600 x 600 x 206
#Memory consumed: 296640000 bytes
#X range: 0.000000 - 599.000000
#Y range: 0.000000 - 599.000000
#Z range: -205.000000 - 0.000000
for i in range(-185, 0, 20):
    layer = points([0, 0, i], [600, 600, i], [100, 100, 1])
    vis.layer(field, layer)
#volume = points([0, 0, -20], [60, 60, 0.5], [100, 100, 100])
#vis.glphys(field, volume, size=0.1)
#volume = random_points([0, 0, -20], [60, 60, 0.5], 1000000)
#vis.glphys(field, volume, size=0.1)

#volume = random_points([0, 0, -20], [60, 60, 0.5], 100)
#vis.streamlines(field, volume, tbound=0.05)
vis.save("sun.flow")
