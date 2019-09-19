import numpy

class Dataset:
    def __init__(self, data, coordinates):
        """
        Initialize new instance of Dataset class.
            :param self: instance of Dataset
            :param data: numpy array of data corresponding to the the coordinates
            :param coordinates: numpy array of coordinates of inidividual points,
        
        The size of the first dimension of [data] and [coordinates] have to be the same. There are two possible formats of the input:

        Randomly sampled dataset:
            data: [N, D]
            coordinates: [N, C]
            N is the number of sample points, 
            D is the number of data variables per sample point
            C is the number of spatial coordinates

        The Dataset class __init__ method performs a Delunay triangulation of the randomly sampled dataset and constructs the interpolation grid. The underlying implementation uses ... TODO

        Rectilinear dataset:
            data: [m, n, o, ..., D]
            coordinates: [m], [n], [o], ...
            m, n, o, ... are the dimensions along the individual axes
            D is the number of data variables per sample point

        The Dataset __init__ method stores the data as-is and performs the interpolation in log(n) time using binary search. 


        """   
        #perform delunay triangulation etc.
        pass


    def interpolate(self, points, method='linear'):
        """
        Perform interpolation of the values in specified points.
            :param self: instance of Dataset
            :param points: points of interpolation
            :param method='linear': interpolation method

        The method returns numpy array of interpolated values corresponding to specified points. There two possible interpolation methods.

        Interplation methods:
            linear --- uses linear (bilinear, trilinear...) interpolation to interpolate the local values. The linear method is faster, but less acurate

            cubic --- usies cubic (bicubic, tricubic...) interpolation to interpolate the local values. The tricubic method is slower, but produces more accurate results

            fourier --- TODO???
        """   
        pass

    def discard(self):
        """
        Discard the existing dataset. The object will still exist, but the memory will be freed.
            :param self: instance of Dataset
        """
        pass

