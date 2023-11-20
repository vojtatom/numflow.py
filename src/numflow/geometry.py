import numpy as np
from numflow.exceptions import NumflowError
from numpy.linalg import norm
import base64
from math import isclose

def check_unique_spacing(unique_points: np.ndarray):
    if len(unique_points) == 1:
        return
    spacing = unique_points[1] - unique_points[0]
    for i in range(1, len(unique_points)):
        if not isclose(unique_points[i] - unique_points[i - 1], spacing):
            raise NumflowError(f"Spacing between points is not uniform, expected {spacing} but found {unique_points[i] - unique_points[i - 1]}")


def layer_meta(layer: np.ndarray):
    """
    Calculate metadata for a layer in a 3D geometry.

    Parameters:
    layer (np.ndarray): A 2D numpy array representing the layer. Each row should contain the x, y, and z coordinates of a point.

    Returns:
    dict: A dictionary containing the following metadata:
        - 'sampling': A list of three integers representing the number of unique values in the x, y, and z coordinates respectively.
        - 'normal': An integer representing the index of the axis perpendicular to the plane. 0 for x-axis, 1 for y-axis, and 2 for z-axis.
        - 'normal_value': A float representing the value of the coordinate along the axis perpendicular to the plane.

    Raises:
    ValueError: If the layer is not a 2D array or if it does not have 3 columns.
    ValueError: If the layer is not a plane, i.e., if it does not have a single unique value along one axis while having multiple unique values along the other two axes.
    """
    
    if len(layer.shape) != 2:
        raise ValueError("Layer must be 2D array")
    
    if layer.shape[1] != 3:
        raise ValueError("Layer must have 3 columns")
    
    x_unique = np.unique(layer[:, 0])
    y_unique = np.unique(layer[:, 1])
    z_unique = np.unique(layer[:, 2])
    
    lx = len(x_unique) == 1
    ly = len(y_unique) == 1
    lz = len(z_unique) == 1
    if not((lx ^ ly ^ lz) and not (lx and ly and lz)):
        raise ValueError("Layer must be a plane")
        
    check_unique_spacing(x_unique)
    check_unique_spacing(y_unique)
    check_unique_spacing(z_unique)
    
    return {
        'sampling': [len(x_unique), len(y_unique), len(z_unique)],
        'normal': 0 if lx else 1 if ly else 2,
        'normal_value': x_unique[0] if lx else y_unique[0] if ly else z_unique[0],
    }
    
    
def cleanup_streamline(streamlines):
    offset = 0
    to_delete = []
    lengths_diff = np.zeros(streamlines['lengths'].shape)

    ### take each streamline
    for i, streamline_length in enumerate(streamlines['lengths']):
        local_values = streamlines['values'][offset:offset + streamline_length,:] 
        norms = norm(local_values, axis=1)

        ### take only those wehre norm is zero
        delete_index = np.where(norms < 10 ** -5)[0]
        
        ### if there are any zero length
        if delete_index.size > 0:
            subseq = np.diff(delete_index)
            subseq = np.insert(subseq, 0, 1)
            delete_index = delete_index[subseq == 1]

            ### if there are any disposable
            if delete_index.size > 0:
                to_delete.extend(offset + delete_index)
                lengths_diff[i] = delete_index.size

        offset += streamline_length

    return {
        'points': np.delete(streamlines['points'], to_delete, axis=0),
        'values': np.delete(streamlines['values'], to_delete, axis=0),
        'times': np.delete(streamlines['times'], to_delete, axis=0),
        'lengths': streamlines['lengths'] - lengths_diff,
        'meta': streamlines['meta'],
    }
    
def serialize_array(array, dtype):
    a = np.ascontiguousarray(dtype(array), dtype=dtype)
    a = base64.b64encode(a.data)
    return a.decode('utf-8')

def boundries(values):
    bounds = {}
    start = np.amin(values, axis=0)
    bounds['start'] = serialize_array(start, np.float32)
    bounds['dim'] = serialize_array(np.amax(values, axis=0) - start, np.float32)
    return bounds