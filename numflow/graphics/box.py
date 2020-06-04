from OpenGL.GLUT import *
from OpenGL.GLU import *
from OpenGL.GL import *

import numpy as np

from .geometry import generateBox
from .primitives import Primitive

class Box(Primitive):
    def __init__(self, program, low, high):
        self.program = program
        self.transparency = 0.5

        self.low = np.array(low, dtype=np.float32) 
        self.min = np.array(low, dtype=np.float32)
        self.high = np.array(high, dtype=np.float32) 
        self.max = np.array(high, dtype=np.float32)
        self.color = np.array([0.5, 0.8, 1], dtype=np.float32)

        self.sel = 0 # def = left, then:
        # bottom, back, right, top, front
        self.selstep = 0.01
        
        
        v = generateBox()

        self.vao = glGenVertexArrays(1)
        glBindVertexArray(self.vao)

        # box vertices
        self.vbo = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, self.vbo)
        glBufferData(GL_ARRAY_BUFFER, v.nbytes, v, GL_STATIC_DRAW)

        self.program.use()
        glEnableVertexAttribArray(program.attr("pos"))
        glVertexAttribPointer(program.attr("pos"), 3, GL_FLOAT, GL_FALSE, 0, None)

        glBindVertexArray(GL_NONE)
        self.program.unuse()


    def changeSel(self):
        self.sel = (self.sel + 1) % 6


    def expand(self):
        if self.sel < 3:
            # changing low
            val = self.low[self.sel]
            self.low[self.sel] = self.min[self.sel] if (val - self.selstep < self.min[self.sel]) else val - self.selstep
        else:
            # changing high
            val = self.high[self.sel - 3]
            self.high[self.sel - 3] = self.max[self.sel - 3] if (val + self.selstep > self.max[self.sel - 3]) else val + self.selstep


    def contract(self):
        if self.sel < 3:
            # changing low
            val = self.low[self.sel] 
            self.low[self.sel] = self.high[self.sel] if (val + self.selstep > self.high[self.sel]) else val + self.selstep
        else:
            # changing high
            val = self.high[self.sel - 3]
            self.high[self.sel - 3] = self.low[self.sel - 3] if (val - self.selstep < self.low[self.sel - 3]) else val - self.selstep


    def draw(self, view, projection, settings):
        self.program.use()

        glBindVertexArray(self.vao)
        #glBindBuffer(GL_ARRAY_BUFFER, self.vbo)

        self.program.setupBeforeDraw(view, projection, settings)
        self.program.uniformVec3f("low", self.low)
        self.program.uniformVec3f("high", self.high)
        self.program.uniformVec3f("color", self.color)

        #glBindBuffer(GL_ARRAY_BUFFER, self.vbo)
        glDrawArrays(GL_LINES, 0, 24)

        glBindVertexArray(GL_NONE)
        self.program.unuse()

