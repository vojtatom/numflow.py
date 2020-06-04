from OpenGL.GLUT import *
from OpenGL.GLU import *
from OpenGL.GL import *

from .text import Text


import numpy as np

class Colormap:
    def __init__(self, program, settings):
        self.program = program

        self.vao = glGenVertexArrays(1)
        glBindVertexArray(self.vao)

        v = np.array([
            0, 0,
            1, 0,
            1, 1,
            0, 0,
            1, 1,
            0, 1
        ], dtype=np.float32)

        self.vbo = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, self.vbo)
        glBufferData(GL_ARRAY_BUFFER, v.nbytes, v, GL_STATIC_DRAW)

        self.program.use()
        glEnableVertexAttribArray(program.attr("pos"))
        glVertexAttribPointer(program.attr("pos"), 2, GL_FLOAT, GL_FALSE, 0, None)

        glBindVertexArray(GL_NONE)
        self.program.unuse()

        self.updateLabels(settings)
    

    def updateLabels(self, settings):
        #setup 2 labels
        self.labels = []



    def draw(self, screenwidth, screenheight):
        self.program.use()

        glBindVertexArray(self.vao)
        self.program.uniformf("screenwidth", screenwidth)
        self.program.uniformf("screenheight", screenheight)
        
        glDrawArrays(GL_TRIANGLES, 0, 6)

        glBindVertexArray(GL_NONE)
        self.program.unuse()