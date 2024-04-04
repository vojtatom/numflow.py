from numflow.compute import RectilinearField3D
from numflow import Dataset, Visualization, points, random_points
import json
import base64
import numpy as np
import math

def nround(x, base=5):
    return base * math.ceil(x/base)

def test_visualization(rectilinear_csv_data: str):
    dataset = Dataset(rectilinear_csv_data)
    assert dataset.file_name == rectilinear_csv_data
    assert type(dataset.data) == RectilinearField3D

    dataset_name = "rectilinear.csv"
    size = "Size: 72000 elements"
    shape = "Shape: 60 x 60 x 20"
    memory = "Memory consumed: 288000 bytes"
    x_range = "X range: 0.100000 - 60.000000"
    y_range = "Y range: 0.100000 - 60.000000"
    z_range = "Z range: -20.000000 - 0.500000"


    info = dataset.info().split("\n")
    assert info[0][-len(dataset_name):] == dataset_name
    assert info[1] == size
    assert info[2] == shape
    assert info[3] == memory
    assert info[4] == x_range
    assert info[5] == y_range
    assert info[6] == z_range

    layer_z = -10
    vis = Visualization()
    layer = points([0.1, 0.1, layer_z], [60, 60, layer_z], [1000, 1000, 1])
    vis.layer(dataset, layer)
    layerS = points([0.1, 0.1, layer_z], [60, 60, layer_z], [200, 200, 1])
    vis.streamlines(dataset, layerS, tbound=0.01, size=0.2, appearance='transparent', sampling=3, divisions=3)
    vis.glphys(dataset, layer, size=0.2, appearance='transparent')
    vis.save(f"test.flow")

    json_file = open("test.flow")
    data = json.load(json_file)
    json_file.close()

    # there is only one scene
    assert len(data) == 1

    scene = data[0]
    assert len(scene) == 4
    
    glyph = scene['glyphs']
    layer = scene['layer']
    streamlines = scene['streamlines']
    stats = scene['stats']

    # test glyphs
    # there is only one glyph group
    assert len(glyph) == 1
    glyph_group = glyph[0]

    assert set(glyph_group.keys()) == {'meta', 'points', 'values'}
    gpoints = glyph_group['points']
    gvalues = glyph_group['values']

    # expected size of glyphs is (1000 * 1000 * 3 * 4) bytes
    # also add the base64 encoding - 4/3 * size = 16000000
    assert len(gpoints) == 16000000
    assert len(gvalues) == 16000000

    # test layer
    # there is only one layer group
    assert len(layer) == 1
    layer_group = layer[0]

    assert set(layer_group.keys()) == {'meta', 'values', 'points'}
    lpoints = layer_group['points']
    lvalues = layer_group['values']

    # expected size of layer is (1000 * 1000 * 3 * 4) bytes
    # also add the base64 encoding - 4/3 * size = 16000000
    assert len(lpoints) == nround(1000 * 1000 * 3 * 4 * 4 / 3, 4)
    assert len(lvalues) == nround(1000 * 1000 * 3 * 4 * 4 / 3, 4)

    # test streamlines
    # there is only one streamlines group
    assert len(streamlines) == 1
    streamlines_group = streamlines[0]

    assert set(streamlines_group.keys()) == {'values', 'times', 'meta', 'lengths', 'points'}
    spoints = streamlines_group['points']
    svalues = streamlines_group['values']
    stimes = streamlines_group['times']
    slengths = streamlines_group['lengths']

    # expected size of lengths is (200 * 200 * 4) bytes
    # also add the base64 encoding - 4/3 * size =~ 213336 with corrections
    assert len(slengths) == nround(200 * 200 * 4 * 4 / 3, 4)

    #decode lengths and sum total
    lengths = base64.b64decode(slengths)
    lengths = np.frombuffer(lengths, dtype=np.int32)
    sum_length = np.sum(lengths)

    expected_point_size = nround(sum_length * 3 * 4 * 4 / 3, 4)
    assert len(spoints) == expected_point_size
    assert len(svalues) == expected_point_size
    expected_time_size = nround(sum_length * 4 * 4 / 3, 4)
    assert len(stimes) == expected_time_size

    # test stats
    assert set(stats.keys()) == {'points', 'values'}
    spoints = stats['points']
    svalues = stats['values']

    # expected statistical keys
    assert set(spoints.keys()) == {'max', 'center', 'min', 'scale_factor'}
    assert set(svalues.keys()) == {'y', 'x', 'z', 'xyz'}    




    
    


