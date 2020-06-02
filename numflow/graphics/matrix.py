import numpy as np
import math
EPSILON = 10e-8


def lookAt(center, target, up):
    f = (target - center) 
    f = f / np.linalg.norm(f)
    s = np.cross(f, up)
    s = s / np.linalg.norm(s)
    u = np.cross(s, f)
    u = u / np.linalg.norm(u)

    m = np.zeros((4, 4))
    m[0, :-1] = s
    m[1, :-1] = u
    m[2, :-1] = -f
    m[-1, -1] = 1.0

    return m

def perspective(field_of_view_y, aspect, z_near, z_far):

    fov_radians = math.radians(field_of_view_y)
    f = math.tan(fov_radians/2)

    a_11 = 1 / (f * aspect)
    a_22 = 1 / f
    a_33 = -(z_near + z_far) / (z_near - z_far)
    a_34 = -2 * z_near * z_far / (z_near - z_far)


    perspective_matrix = np.array([
        [a_11, 0, 0, 0],       
        [0, a_22, 0, 0],       
        [0, 0, a_33, a_34],    
        [0, 0, -1, 0]          
    ]).T

    return perspective_matrix