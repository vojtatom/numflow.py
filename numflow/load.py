from .exception import NumflowException
from .dataset import RectilinearDataset, ScipyRectilinearDataset
import numpy as np
import gc
import time
from astropy.io import fits
from .cnumflow import construct_rectilinear_3d, load_file, sample_dataset_3d

def save_fits(values, ax, ay, az):
    hdu = fits.PrimaryHDU()
    hdu.header.set('EXTEND', True)
    images = [
        hdu,
        fits.ImageHDU(values),
        fits.ImageHDU(ax),
        fits.ImageHDU(ay),
        fits.ImageHDU(az),
    ]
    
    hdulist = fits.HDUList(images)
    hdulist.writeto('tmp.fits')


def load_fits(file):
    hdul = fits.open(file, memmap=True, mode='denywrite')
    values =  hdul[1].data.astype(np.float32) 
    grid = [ hdul[2].data.astype(np.float32), hdul[3].data.astype(np.float32), hdul[4].data.astype(np.float32) ]

    return grid, values


def load(filename, separator=",", points_clustering_tolerance=0.0001, mode="scipy"):
    """Loads dataset from .npy or .csv file in expected format.
    Expected format: 4 or 6 columns with format, a single line looks like:

            x-value, y-value, z-name, x-coordinate, y-coordinate, z-coordinate

    The method automatically detects rectilinear datasets. 
    
    Arguments:
        filename {str} -- filename with suffix .csv or .npy
    
    Keyword Arguments:
        separator {str} -- csv separator, ignored for .npy files (default: {","})
        points_clustering_tolerance {int} -- epsilon delta to be 
        taken into account when scanning for rectilinear datasets (default: {4})
        mode {str} -- mode of dataset, supported values: scipy or c (default: {"scipy"})
    
    Raises:
        NumflowException: raised for unsupported or misformatted files
    
    Returns:
        scipy.interpolator.RegularGridInterpolator -- default interpolator
    """

    #time.sleep(3)
    
    if mode not in ["scipy", "c", "both"]:
       raise NumflowException("Unknown mode: {}".format(mode)) 
    
    if filename.endswith(".npy"):
        data = np.load(filename)
    elif filename.endswith(".csv"):
        data = load_file(filename, separator)
    elif filename.endswith(".fits"):
        axis, data = load_fits(filename)
    else:
       raise NumflowException("Unknown file format: .{}".format(filename.split(".")[-1])) 


    if not filename.endswith(".fits"):
        if data.ndim != 2:
            raise NumflowException("Unsuported number of dimensions: {}".format(data.ndim))
        
        if data.shape[1] != 6:
            raise NumflowException("Unsuported number of dataset columns: {}".format(data.shape[1]))
        print("numflow.load: input file parsed, now testing rectilinearity...")
        #try constructing rectilinear
        gc.collect()

        axis, data = construct_rectilinear_3d(data, points_clustering_tolerance)
        save_fits(data, axis[0], axis[1], axis[2])

        #if not filename.endswith(".npy"):
        #    np.save('tmp.npy', data)


    if axis is None:
        #TO BE IMPROVED
        raise NumflowException("Only rectilinear datasets supported")
    else:
        #pyramide = build_pyramide3D(axis, data)
        if mode == "c":
            return RectilinearDataset(axis, data)
        elif mode == "scipy":
            return ScipyRectilinearDataset(axis, data)
        #elif mode == "both":
        return RectilinearDataset(axis, data), ScipyRectilinearDataset(axis, data)


def sample_rectilinear_dataset(dataset, x, y, z):
    pos, vals = sample_dataset_3d(dataset.data, dataset.axis, x, y, z)
    return pos, vals