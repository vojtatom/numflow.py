from OpenGL.GLUT import *
from OpenGL.GLU import *
from OpenGL.GL import *

import numpy as np
import math
from pyrr.matrix44 import create_look_at, create_perspective_projection_matrix, create_from_axis_rotation, multiply, apply_to_vector


ROT_STEP = 0.1

class Camera:
    def __init__(self, width, height):
        self.pos = np.array([0, 0, 10], dtype=np.float32) 
        self.center = np.array([0, 0, 0], dtype=np.float32) 
        self.up = np.array([0, 1, 0], dtype=np.float32)
        self.width = width
        self.height = height
        self.resize(width, height)


    def resize(self, width, height):
        self.width = width
        self.height = height
        self.recalc()


    def recalc(self):
        #view = glm.lookAt(self.pos, self.center, self.up)
        #proj = glm.perspective(45, self.width / self.height, 0.1, 1000)

        view = create_look_at(self.pos, self.center, self.up)
        proj = create_perspective_projection_matrix(45, self.width / self.height, 0.1, 1000)
        self.view, self.projection =  view, proj


    def rotate(self, x, y):
        a_x = -math.radians(x) * ROT_STEP
        a_y = math.radians(y) * ROT_STEP
        front = self.center - self.pos

        axes_x = np.cross(self.up, front)
        axes_y = self.up

        rotmat = create_from_axis_rotation(axes_y, a_x)
        rotmat = multiply(rotmat, create_from_axis_rotation(axes_x, a_y))
        front = apply_to_vector(rotmat, front)

        self.pos = self.center - front
        self.up = apply_to_vector(rotmat, self.up)

        self.recalc()


    def set_center(self, center):
        self.center = center

    def zoom_out(self):
        front = self.center - self.pos
        size = np.linalg.norm(front)
        front = front / size

        self.pos = self.center - front * (size + 1) 
        self.recalc()

    def zoom_in(self):
        front = self.center - self.pos
        size = np.linalg.norm(front)
        front = front / size

        self.pos = self.center - front * max(size - 1, 1) 
        self.recalc()

    
    