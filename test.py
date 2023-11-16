from numflow import load_field
import numpy as np

field = load_field("tests/testdata/rectilinear.csv")
data = np.array(field.velocities)
print(len(data))
x = np.array(field.x_coords)
print(len(x), x)
y = np.array(field.y_coords)
print(len(y), y)
z = np.array(field.z_coords)
print(len(z), z)
print(data[:6])