import numpy
from .primitives import Primitive

class Streamline(Primitive):
    def __init__(self, coordinates, lengths, values):
        """
        Initializes new instance of the Streamline class. Encapsulates the interpoalted streamlines. Container.
            :param self: instance of Streamline 
            :param coordinates: spatial coordinates of the values
            :param lengths: lengths of inidividual streamlines
            :param values: individual values

        The coordinates, indices and values are expected in the following format:
            data: [N, D]
            indices: [L]
            coordinates: [N, C]
            N is the number of sample points, 
            L contains the lengths of the individual streamlines (numer of points per streamline)
            D is the number of data variables per sample point
            C is the number of spatial coordinates
        """   
        pass


## streamline method 
def streamline(dataset, seeding, method='simple', solver='RK45', interpolator='linear'):    
    """
    Numericaly traces the streamlines in the dataset.
        :param dataset: instance of a dataset
        :param seeding: numpy array of seeding points 
        :param method='simple': construction method
        :param solver='RK45': used integration solver
        :param interpolator='linear': interpolation method

    Returns instance of Streamline class.
    """