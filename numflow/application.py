import numpy as np

from .graphics import Box, Context, Camera, Glyphs, Layer
from .load import load

from .exception import NumflowException


def points(start, end, sampling):
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


class Application:
    def __init__(self):
        #init so it does not fall
        self.camera = None

        self.gl = Context(self)
        self.camera = Camera(500, 500)
        self.boxes = []
        self.slices = []
        self.glyphs = []
        self.dataset = False
        
        self.stats = {
            "min": 0,
            "max": 0
        }


    def load_dataset(self, file):
        self.dataset = load(file)
        
        print(f"dataset {file} loaded")

        #add main bounding box to the visualization
        box = Box(self.gl.boxProgram, self.dataset.low, self.dataset.high)
        boxCenter = 0.5 * (self.dataset.low + self.dataset.high)
        self.camera.set_center(boxCenter)
        self.boxes.append(box)


    def add_glyphs(self):
        if not self.dataset:
            raise NumflowException("Dataset needed.")

        seed_points = np.random.rand(2000, 3) * (self.dataset.high - self.dataset.low) + self.dataset.low
        values = self.dataset(seed_points)
        self.updateStats(values)
        glyphs = Glyphs(self.gl.glyphProgram, seed_points, values)
        self.glyphs.append(glyphs)


    def add_slice(self, slice_coord, axis="x", resolution=[20, 20]):
        if not self.dataset:
            raise NumflowException("Dataset needed.")

        axis_id = ["x", "y", "z"].index(axis)
        print(axis_id)

        start = self.dataset.low.copy()
        end = self.dataset.high.copy()
        start[axis_id] = slice_coord
        end[axis_id] = slice_coord
        resolution.insert(axis_id, 1)
        grid_points = points(start, end, resolution)
        values = self.dataset(grid_points)
        self.updateStats(values)

        layer = Layer(self.gl.sliceProgram, grid_points, values, resolution, axis_id, slice_coord)
        self.slices.append(layer)



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

        for layer in self.slices:
            layer.draw(self.camera.view, self.camera.projection, self.stats)


    def updateStats(self, values):
        lengths = np.linalg.norm(values, axis=1)
        amin = np.amin(lengths)
        amax = np.amax(lengths)

        self.stats["min"] = min(self.stats["min"], amin)
        self.stats["max"] = max(self.stats["max"], amax)