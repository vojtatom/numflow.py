import numpy as np
from scipy.integrate import solve_ivp
from .cnumflow import integrate3D

def cleanup_streamlines(positions, values, lengths, times):
    """
    Cleans up streamline data. Removes consecutive 
    points with the same positions.
        :param streamlines: dict with points, values, lengths, times, and meta
    """
    offset = 0
    to_delete = []
    lengths_diff = np.zeros(lengths.shape)

    ### take each streamline
    for i, streamline_length in enumerate(lengths):
        local_values = values[offset:offset + streamline_length,:] 
        norms = np.linalg.norm(local_values, axis=1)

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

    positions = np.delete(positions, to_delete, axis=0) 
    values = np.delete(values, to_delete, axis=0) 
    times = np.delete(times, to_delete, axis=0) 
    lengths = lengths - lengths_diff

    return positions, values, lengths, times
    

def cstreamlines(dataset, t0, t_bound, starting_points, abort):
    #solve the integration inside C function from cnumflow
    starting_points = np.ascontiguousarray(np.array(starting_points, dtype=np.float32))
    positions, values, times, lengths = integrate3D(dataset.data, dataset.axis[0], dataset.axis[1], dataset.axis[2], starting_points, t0, t_bound)
    return positions, values, lengths, times


def sstreamlines(dataset, t0, t_bound, starting_points, abort):
    """Performs integration inside given dataset using SciPy solver.


    Arguments:
        dataset {Dataset} -- dataset
        t0 {float} -- integration start time
        t_bound {float} -- integration end time
        starting_points {np.ndarray} -- seeding points for streamlines in 2D array
        abort {threading.Event} -- event signaling the abort of the integration

    Raises:
        Exception: raises Exception only on abort

    Returns:
        list [positions, values, lengths, times] -- list of parameters obtained during integration
    """
    
    positions = None
    times = None
    lengths = np.empty((starting_points.shape[0],), dtype=np.int)

    if dataset.type == 'c':
        ### needs integration of parameter t...
        def interpolate(t, y):
            return dataset(np.array([y,]))[0]

    elif dataset.type == 'scipy':
        def interpolate(t, y):
            return dataset(y)
    
    
    for i in range(starting_points.shape[0]):
        sol = solve_ivp(interpolate, (t0, t_bound), starting_points[i])

        if positions is None:
            positions = np.transpose(sol.y)
            times = sol.t
        else:
            positions = np.append(positions, np.transpose(sol.y), axis=0)
            times = np.append(times, np.transpose(sol.t), axis=0)

        lengths[i] = sol.t.shape[0]
        
        if abort.is_set():
            raise Exception('Abort!')

    values = dataset(positions)
    
    del interpolate
    cleanup_streamlines(positions, values, lengths, times)
    return positions, values, lengths, times
