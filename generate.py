from math import sin, cos
import numpy as np

def field(x, y, z):
	return [-y * z, x * z, 0]

gridx = np.linspace(-20, 20, num=60, endpoint=True) 
gridy = np.linspace(-20, 20, num=60, endpoint=True) 
gridz = np.linspace(-20, 20, num=60, endpoint=True)

data = ""
with open("test2.csv", "wt") as file:	
	for x in gridx:
		for y in gridy:
			for z in gridz:
				val = field(x, y, z)
				data += "{0:.2f},{1:.2f},{2:.2f},{3:.2f},{4:.2f},{5:.2f}\n".format(x, y, z, val[0], val[1], val[2])

		file.write(data)
		data = ""
	