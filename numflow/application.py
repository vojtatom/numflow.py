import numpy as np

from .graphics import Box, Context, Camera, Glyphs, Layer, Streamline, Colormap
from .load import load
from .integrate import sstreamlines, cstreamlines

from .exception import NumflowException
from threading import Event


def regular_points(start, end, sampling):
    """
    Fonction producing regularly sampled seeding points. 
    The seeding space is defined by bounding cuboid. 
        :param start: near bottom left corner of the cuboid
        :param end: far top right corner of the cuboid
        :param sampling: sampling along individual axes (tuple of 3 ints) 
    """

    spc = []
    for s, e, n in zip(start, end, sampling):
        spc.append(np.linspace(s, e, n, endpoint=True))

    k = np.reshape( \
            np.transpose( \
                np.meshgrid(*spc, sparse=False, indexing='ij') \
                ), (np.prod(sampling), 3) \
        )

    return k

def random_points(start, end, dataset, numSamples):
    #TODO comments
    if start == None:
        start = dataset.low
    else:
        start = np.array(start)
        start = np.amax([start, dataset.low], axis=0)

    if end == None:
        end = dataset.high
    else:
        end = np.array(end)
        end = np.amin([end, dataset.high], axis=0)
    

    return np.random.rand(numSamples, 3) * (end - start) + start


class Application:
    def __init__(self):
        #init so it does not fall
        self.camera = None

        self.contex = Context(self)
        self.camera = Camera(500, 500)
        self.boxes = []
        self.layers = []
        self.glyphs = []
        self.streamlines = []
        self.dataset = False

        
        self.settings = {
            #minimal and maximal magnitudes
            "min": 0,
            "max": 0,
            #thresholds for filtering based on magnitude
            "min_threshold": 0,
            "max_threshold": float(np.inf)
        }
        
        self.colormap = Colormap(self.contex.colormapProgram, self.settings)


    #------------------------------------------------------------------------------------------------
    # USER FUNCTIONS
    #------------------------------------------------------------------------------------------------

    def load_dataset(self, file):
        #TODO comments
        self.dataset = load(file, mode='c')
        
        print(f"dataset {file} loaded")
        print(f"Dataset stats:")
        print(f"    resolution {self.dataset.res}")
        print(f"    low        {self.dataset.low}")
        print(f"    high       {self.dataset.high}")

        #add main bounding box to the visualization
        box = Box(self.contex.boxProgram, self.dataset.low, self.dataset.high)
        boxCenter = 0.5 * (self.dataset.low + self.dataset.high)
        self.camera.set_center(boxCenter)
        self.boxes.append(box)


    def add_glyphs(self, numSamples=2000, low=None, high=None):
        #TODO comments
        if not self.dataset:
            raise NumflowException("Dataset needed.")

        seed_points = random_points(low, high, self.dataset, numSamples)

        values = self.dataset(seed_points)
        self.updateStats(values)
        glyphs = Glyphs(self.contex.glyphProgram, seed_points, values)
        self.glyphs.append(glyphs)


    def add_slice(self, slice_coord, axis="x", resolution=[20, 20]):
        #TODO comments
        if not self.dataset:
            raise NumflowException("Dataset needed.")

        axis_id = ["x", "y", "z"].index(axis)

        start = self.dataset.low.copy()
        end = self.dataset.high.copy()
        start[axis_id] = slice_coord
        end[axis_id] = slice_coord
        resolution.insert(axis_id, 1)
        grid_points = regular_points(start, end, resolution)
        values = self.dataset(grid_points)
        self.updateStats(values)

        layer = Layer(self.contex.sliceProgram, grid_points, values, resolution, axis_id, slice_coord)
        self.layers.append(layer)


    def add_streamline(self, t0, t_bound, numSamples=10, low=None, high=None):
        #TODO comments
        if not self.dataset:
            raise NumflowException("Dataset needed.")

        seed_points = random_points(low, high, self.dataset, numSamples)

        abort = Event() #for compatibility...
        positions, values, lengths, times = cstreamlines(self.dataset, t0, t_bound, seed_points, abort)
        self.updateStats(values)
        streamline = Streamline(self.contex.streamlineProgram, positions, values, lengths, times)
        self.streamlines.append(streamline)

    #------------------------------------------------------------------------------------------------

    def run(self):
        self.contex.runLoop()


    def draw(self):
        if self.camera == None:
            return

        #single frame drawing, high level however
        for box in self.boxes:
            box.draw(self.camera.view, self.camera.projection, self.settings)

        for glyph in self.glyphs:
            glyph.draw(self.camera.view, self.camera.projection, self.settings)
        
        for layer in self.layers:
            layer.draw(self.camera.view, self.camera.projection, self.settings)

        for streamline in self.streamlines:
            streamline.draw(self.camera.view, self.camera.projection, self.settings)

        #draws the colormap strip on the side
        self.colormap.draw(self.camera.width, self.camera.height, self.settings)


    def updateStats(self, values):
        values[np.isnan(values)] = 0
        values[np.isnan(values)] = 0
        lengths = np.linalg.norm(values, axis=1)
        amin = np.amin(lengths)
        amax = np.amax(lengths)

        self.settings["min"] = min(self.settings["min"], amin)
        self.settings["max"] = max(self.settings["max"], amax)

        if self.settings["max"] < self.settings["max_threshold"]:
            self.settings["max_threshold"] = self.settings["max"] 

        print(f"min, {amin}")
        print(f"max, {amax}")
        print(f"min thresh, {self.settings['min_threshold']}")
        print(f"max thresh, {self.settings['max_threshold']}")