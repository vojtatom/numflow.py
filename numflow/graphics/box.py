from OpenGL.GLUT import *
from OpenGL.GLU import *
from OpenGL.GL import *

import numpy as np

from .geometry import generateBox
from .primitives import Primitive

class Box(Primitive):
    def __init__(self, program, low, high):
        self.program = program
        self.low = np.array(low, dtype=np.float32) 
        self.high = np.array(high, dtype=np.float32) 
        
        v = generateBox()
        print(v)

        self.vao = glGenVertexArrays(1)
        glBindVertexArray(self.vao)

        # box vertices
        self.vbo = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, self.vbo)
        glBufferData(GL_ARRAY_BUFFER, v.nbytes, v, GL_STATIC_DRAW)

        glEnableVertexAttribArray(program.attr("pos"))
        glVertexAttribPointer(program.attr("pos"), 3, GL_FLOAT, GL_FALSE, 0, None)

    def draw(self, view, projection):
        #print("drawing box")
        #print(view, projection)
        #print(self.low, self.high)

        self.program.setupViewProjection(view, projection)
        self.program.uniformVec3f("low", self.low)
        self.program.uniformVec3f("high", self.high)

        glBindVertexArray(self.vao)
        glBindBuffer(GL_ARRAY_BUFFER, self.vbo)
        glDrawArrays(GL_LINES, 0, 72)
