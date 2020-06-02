import numpy as np

from .graphics import Box, Context, Camera
from .load import load


def boundingBox(context, dataset):
    low = [ np.amin(ax) for ax in dataset.axis ]
    high = [ np.amax(ax) for ax in dataset.axis ]
    box = Box(context.boxProgram, low, high)
    return box


class Application:
    def __init__(self):
        #init so it does not fall
        self.camera = None

        self.gl = Context(self)
        self.camera = Camera(500, 500)
        self.boxes = []


    def load_dataset(self, file):
        self.dataset = load(file)
        
        print(f"dataset {file} loaded")

        box = boundingBox(self.gl, self.dataset)
        self.boxes.append(box)


    def run(self):
        self.gl.runLoop()


    def draw(self):
        if self.camera == None:
            return

        #print("drawing")
        #single frame drawing, high level however
        for box in self.boxes:
            box.draw(self.camera.view, self.camera.projection)


