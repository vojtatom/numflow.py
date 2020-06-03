import numpy as np

from .graphics import Box, Context, Camera, Glyphs, Layer, Streamline
from .load import load
from .integrate import sstreamlines

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

        self.gl = Context(self)
        self.camera = Camera(500, 500)
        self.boxes = []
        self.layers = []
        self.glyphs = []
        self.streamlines = []
        self.dataset = False
        
        self.stats = {
            "min": 0,
            "max": 0
        }

    #------------------------------------------------------------------------------------------------
    # USER FUNCTIONS
    #------------------------------------------------------------------------------------------------

    def load_dataset(self, file):
        #TODO comments
        self.dataset = load(file)
        
        print(f"dataset {file} loaded")
        print(f"Dataset stats:")
        print(f"    resolution {self.dataset.res}")
        print(f"    low        {self.dataset.low}")
        print(f"    high       {self.dataset.high}")

        #add main bounding box to the visualization
        box = Box(self.gl.boxProgram, self.dataset.low, self.dataset.high)
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
        glyphs = Glyphs(self.gl.glyphProgram, seed_points, values)
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

        layer = Layer(self.gl.sliceProgram, grid_points, values, resolution, axis_id, slice_coord)
        self.layers.append(layer)


    def add_streamline(self, t0, t_bound, numSamples=10, low=None, high=None):
        #TODO comments
        if not self.dataset:
            raise NumflowException("Dataset needed.")

        seed_points = random_points(low, high, self.dataset, numSamples)

        abort = Event() #for compatibility...
        positions, values, lengths, times = sstreamlines(self.dataset, t0, t_bound, seed_points, abort)
        self.updateStats(values)
        streamline = Streamline(self.gl.streamlineProgram, positions, values, lengths, times)
        self.streamlines.append(streamline)

    #------------------------------------------------------------------------------------------------

    def run(self):
        self.gl.runLoop()


    def draw(self):
        if self.camera == None:
            return

        #single frame drawing, high level however
        for box in self.boxes:
            box.draw(self.camera.view, self.camera.projection, self.stats)

        for glyph in self.glyphs:
            glyph.draw(self.camera.view, self.camera.projection, self.stats)
        
        for layer in self.layers:
            layer.draw(self.camera.view, self.camera.projection, self.stats)

        for streamline in self.streamlines:
            streamline.draw(self.camera.view, self.camera.projection, self.stats)


    def updateStats(self, values):
        lengths = np.linalg.norm(values, axis=1)
        amin = np.amin(lengths)
        amax = np.amax(lengths)

        self.stats["min"] = min(self.stats["min"], amin)
        self.stats["max"] = max(self.stats["max"], amax)