from OpenGL.GLUT import *
from OpenGL.GLU import *
from OpenGL.GL import *

import numpy as np
from .matrix import perspective, lookAt


class Camera:
    def __init__(self, width, height):
        self.pos = np.array([0, 0, 10], dtype=np.float32) 
        self.center = np.array([0, 0, 0], dtype=np.float32) 
        self.up = np.array([0, 1, 0], dtype=np.float32) 
        self.width = width
        self.height = height
        self.resize(width, height)


    def resize(self, width, height):
        self.height = height
        self.width = width

        self.view, self.projection = self.recalc()


    def recalc(self):
        print("resize")
        view = lookAt(self.center, self.pos, self.up)

        print("view", view)

        projection = perspective(45, self.width / self.height, 1, 1000)
        return view, projection


    