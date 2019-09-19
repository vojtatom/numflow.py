import numpy
from .primitives import Primitive

class Surface(Primitive):
    def __init__(self, coordinates, indices, values):
        """
        Initializes new instance of the Surface class. Encapsulates the interpoalted coordinates and values. Container.
            :param self: instance of Surface 
            :param coordinates: spatial coordinates of the values
            :param indices: indices of coordinates forming triangles 
            :param values: individual values

        The coordinates, indices and values are expected in the following format:
            data: [N, D]
            indices: [3 * K]
            coordinates: [N, C]
            N is the number of sample points, 
            K is the numer of triangles forming the surface
            D is the number of data variables per sample point
            C is the number of spatial coordinates
        """   
        pass