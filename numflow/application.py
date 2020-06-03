import numpy as np

from .graphics import Box, Context, Camera, Glyphs
from .load import load

from .exception import NumflowException


class Application:
    def __init__(self):
        #init so it does not fall
        self.camera = None

        self.gl = Context(self)
        self.camera = Camera(500, 500)
        self.boxes = []
        self.glyphs = []
        self.dataset = False


    def load_dataset(self, file):
        self.dataset = load(file)
        
        print(f"dataset {file} loaded")

        #add main bounding box to the visualization
        box = Box(self.gl.boxProgram, self.dataset.low, self.dataset.high)
        boxCenter = 0.5 * (self.dataset.low + self.dataset.high)
        #self.camera.set_center(boxCenter)
        self.boxes.append(box)


    def add_glyphs(self):
        #add glyphs
        if not self.dataset:
            raise NumflowException("Dataset needed.")

        seed_points = np.random.rand(200, 3) * (self.dataset.high - self.dataset.low) + self.dataset.low
        values = self.dataset(seed_points)
        glyphs = Glyphs(self.gl.glyphProgram, seed_points, values)
        self.glyphs.append(glyphs)

    def run(self):
        self.gl.runLoop()


    def draw(self):
        if self.camera == None:
            return

        #single frame drawing, high level however
        for box in self.boxes:
            box.draw(self.camera.view, self.camera.projection)

        for glyph in self.glyphs:
            glyph.draw(self.camera.view, self.camera.projection)

        


