from numflow.kernels import dataset_kernel, glyph_kernel, stream_kernel, points_kernel
from math import isclose
import numpy as np

tolrance = 1e-6

def test_dataset_kernel(rectilinear_csv_data: str):
    field = dataset_kernel(rectilinear_csv_data)
    assert field != None
    x = field.x_coords()
    assert type(x) is memoryview
    assert isclose(x[0], 0.10, rel_tol=tolrance)
    assert isclose(x[-1], 60.0, rel_tol=tolrance)
    y = field.y_coords()
    assert type(y) is memoryview
    assert isclose(y[0], 0.10, rel_tol=tolrance)
    assert isclose(y[-1], 60.0, rel_tol=tolrance)
    z = field.z_coords()
    assert type(z) is memoryview
    assert isclose(z[0], -20.00, rel_tol=tolrance)
    assert isclose(z[-1], 0.50, rel_tol=tolrance)
    
    
def test_points_kernel():
    points = points_kernel([0, 0, -10], [60, 60, -10], [10, 10, 1])
    assert type(points) is np.ndarray
    #should return a list of 100 points
    assert points.shape == (100, 3)
    
   
def test_glyph_kernel(rectilinear_csv_data: str):
    field = dataset_kernel(rectilinear_csv_data)
    points = points_kernel([0.1, 0.1, -10], [60, 60, -10], [10, 10, 1])
    glyphs = glyph_kernel(field, points)
    assert np.shape(glyphs) == (100, 3)
    
    
def test_streamline_kernel(rectilinear_csv_data: str):
    field = dataset_kernel(rectilinear_csv_data)
    points = points_kernel([0.1, 0.1, -10], [60, 60, -10], [10, 10, 1])
    streamlines = stream_kernel(field, points, 0, 10)
    assert len(streamlines.l()) == 100
    assert np.shape(streamlines.l()) == (100,)
    assert len(streamlines.t()) == sum(streamlines.l())
    assert np.shape(streamlines.t()) == (sum(streamlines.l()),)
    assert len(streamlines.y()) == sum(streamlines.l())
    assert np.shape(streamlines.y()) == (sum(streamlines.l()), 3)
    assert len(streamlines.f()) == sum(streamlines.l())
    assert np.shape(streamlines.f()) == (sum(streamlines.l()), 3)
    