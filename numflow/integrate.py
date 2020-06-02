import numpy as np
from scipy.integrate import solve_ivp
from .cnumflow import integrate3D


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
    return positions, values, lengths, times