import json
import numpy as np
from numpy.linalg import norm
from numflow.encoder import CustomJSONEncoder
from numflow.geometry import boundries, cleanup_streamline, layer_meta, serialize_array
from numflow.dataset import Dataset
from numflow.kernels import glyph_kernel, stream_kernel
from numflow.exceptions import NumflowError
import base64

defaultCM = {
    'sampling': 5,
    'colors': [
        [68/255, 1/255, 84/255, 1],
        [59/255, 82/255, 139/255, 1],
        [33/255, 145/255, 140/255, 1], 
        [94/255, 201/255, 98/255, 1], 
        [253/255, 231/255, 37/255, 1], 
        ]
}

allowed_appearances = ['solid', 'transparent']

def parse_appearance(appearance: str):
    return appearance if appearance in allowed_appearances else 'solid'

class Visualization:
    def __init__(self):
        self.layer_data = []
        self.glyphs_data = []
        self.streamlines_data = []
    
    def glphys(self, dataset: Dataset, points: np.ndarray, appearance: str = 'solid', size: float = 1):
        appearance = parse_appearance(appearance)
        
        #interpolate point values
        values = glyph_kernel(dataset.data, points)
        
        #glyphs meta... 
        meta = {
            'size': size,
            'sampling': 4,
            'geometry': 'line',
            'colormap': defaultCM,
            'appearance': appearance,
        }
            
        #return all flatenned
        self.glyphs_data.append({
            'values': values, 
            'points': points, 
            'meta': meta
        })
    
    def layer(self, dataset: Dataset, points: np.ndarray, appearance: str = 'solid'):
        appearance = parse_appearance(appearance)
        
        meta = layer_meta(points)
        values = glyph_kernel(dataset.data, points)

        #layer meta... 
        meta = {
                'colormap': defaultCM,
                'appearance': appearance,
                'geometry': meta,
            }

        #return all flatenned
        self.layer_data.append({
            'values': values, 
            'points': points, 
            'meta': meta
        })
    
    def streamlines(self, dataset: Dataset, sample_points: np.ndarray, appearance: str = 'solid', size: float = 1, t0: float = 0, tbound: float = 1, sampling: int = 6, divisions: int = 10):
        appearance = parse_appearance(appearance)

        #integrate per points group
        streamline = stream_kernel(dataset.data, sample_points, t0, tbound)
        values = np.array(streamline.f(), copy=True)
        points = np.array(streamline.y(), copy=True)
        lengths = np.array(streamline.l(), copy=True)
        times = np.array(streamline.t(), copy=True)
        del streamline
        
        meta = {
            'colormap': defaultCM,
            'appearance': appearance,
            'size': size,
            't0': t0,
            'tbound': tbound,
            'sampling': sampling,
            'divisions': divisions,
        }

        #return all flatenned
        self.streamlines_data.append({
            'values': values, 
            'points': points, 
            'lengths': lengths, 
            'times': times, 
            'meta': meta
        })


    def colormap(self, *args):
        if len(args) < 2 or len(args) > 5:
            raise NumflowError("Colormap must have 2 to 5 colors")
        
        for arg in args:
            if len(arg) != 3:
                raise NumflowError("Colormap colors must be arrays of 3")
        
        colormap = {
            'sampling': len(args), 
            'colors': args
        }
        
        for glyphs in self.glyphs_data:
            glyphs['meta']['colormap'] = colormap
            
        for streamlines in self.streamlines_data:
            streamlines['meta']['colormap'] = colormap
            
        for layer in self.layer_data:
            layer['meta']['colormap'] = colormap
        
              
    def save(self, file_name: str, width_max: float = 100):
        ### statistics
        points = None
        values = None

        def setup_stats(points, values, p, v):
            if values is None:
                values = v
                points = p
            else:
                values = np.concatenate((values, v), axis=0)
                points = np.concatenate((points, p), axis=0)
            return points, values


        content = {}
        if len(self.layer_data) > 0:
            ### indata['layer'] = [{'points': array, 'values': array}, ...]
            layer_encoded = []
            for layer in self.layer_data:
                layer_group = {}
                layer_group['points'] = serialize_array(layer['points'], np.float32)
                layer_group['values'] = serialize_array(layer['values'], np.float32)
                layer_group['meta'] = layer['meta']
                layer_group['meta']['bounds'] = boundries(layer['points'])
                layer_encoded.append(layer_group)
                points, values = setup_stats(points, values, layer['points'], layer['values'])

            content['layer'] = layer_encoded

        if len(self.glyphs_data) > 0:
            ### indata['glyphs'] = [{'points': array, 'values': array}, ...]
            glyphs_encoded = []
            for glyphs in self.glyphs_data:
                glyphs_group = {}
                glyphs_group['points'] = serialize_array(glyphs['points'], np.float32)
                glyphs_group['values'] = serialize_array(glyphs['values'], np.float32)
                glyphs_group['meta'] = glyphs['meta']
                glyphs_group['meta']['bounds'] = boundries(glyphs['points'])
                glyphs_encoded.append(glyphs_group)
                points, values = setup_stats(points, values, glyphs['points'], glyphs['values'])

            content['glyphs'] = glyphs_encoded

        if len(self.streamlines_data) > 0:
            ### indata['streamlines'] = [{'points': array, 'values': array, 'lengths': array}, ...]
            stream_encoded = []
            for stream in self.streamlines_data:
                ##postproc, cleanup zero speeds
                stream = cleanup_streamline(stream)

                stream_group = {}
                stream_group['points'] = serialize_array(stream['points'], np.float32)
                stream_group['values'] = serialize_array(stream['values'], np.float32)
                stream_group['lengths'] = serialize_array(stream['lengths'], np.int32)
                stream_group['times'] = serialize_array(stream['times'], np.float32)
                stream_group['meta'] = stream['meta']
                stream_group['meta']['bounds'] = boundries(stream['points'])
                stream_encoded.append(stream_group)
                points, values = setup_stats(points, values, stream['points'], stream['values'])
            
            content['streamlines'] = stream_encoded
                
        ### points and values now have concatenated complete info in them...
        velocity = norm(values, axis=1)
        min_points = np.amin(points, axis=0)
        max_points = np.amax(points, axis=0)
        stats = {
            'values' : {
                'xyz' : {
                    'minSize' :    np.amin(velocity),
                    'maxSize' :    np.amax(velocity),
                    'stdSize' :    np.std(velocity),
                    'meanSize':    np.mean(velocity),
                    'medianSize' : np.median(velocity),
                },
                'x' : {
                    'minSize' :    np.amin(values[:,0]),
                    'maxSize' :    np.amax(values[:,0]),
                    'stdSize' :    np.std(values[:,0]),
                    'meanSize':    np.mean(values[:,0]),
                    'medianSize' : np.median(values[:,0]),
                },
                'y' : {
                    'minSize' :    np.amin(values[:,1]),
                    'maxSize' :    np.amax(values[:,1]),
                    'stdSize' :    np.std(values[:,1]),
                    'meanSize':    np.mean(values[:,1]),
                    'medianSize' : np.median(values[:,1]),
                },
                'z' : {
                    'minSize' :    np.amin(values[:,2]),
                    'maxSize' :    np.amax(values[:,2]),
                    'stdSize' :    np.std(values[:,2]),
                    'meanSize':    np.mean(values[:,2]),
                    'medianSize' : np.median(values[:,2]),
                },
            },
            'points' : {
                'min' : serialize_array(min_points, np.float32),
                'max' : serialize_array(max_points, np.float32),
                'center': serialize_array(np.mean(points, axis=0), np.float32),
                'scale_factor': width_max / np.amax(max_points - min_points),
            }
        }

        content['stats'] = stats
        with open(file_name, 'w') as outfile:
            json.dump([content], outfile, sort_keys=True, indent=4, cls=CustomJSONEncoder)