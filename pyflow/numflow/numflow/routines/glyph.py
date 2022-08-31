import numpy
from .primitives import Primitive

class Glyph(Primitive):
    def __init__(self, coordinates, values):
        """
        Initializes new instance of the Glyph class. Encapsulates the interpoalted coordinates and values. Container.
            :param self: instance of Glyph 
            :param coordinates: spatial coordinates of the values
            :param values: individual values

        The coordinates and values are expected in the following format:
            data: [N, D]
            coordinates: [N, C]
            N is the number of sample points, 
            D is the number of data variables per sample point
            C is the number of spatial coordinates
        """   
        pass