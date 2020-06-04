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

        #labels 
        self.label_bottom_value = settings["min"]
        self.label_top_value = settings["max"]

        self.labels = []
        for l in range(5):
            self.labels.append((l, Text(str("to be updated"), fsize=25)))
    

    def updateLabels(self, settings):
        if self.label_bottom_value != settings["min"] or self.label_top_value != settings["max"]:
            self.label_bottom_value = settings["min"]
            self.label_top_value = settings["max"]

            for i, t in self.labels:
                fac = i / (len(self.labels) - 1)
                t.updateText(str(f"{fac * self.label_bottom_value + (1 - fac) * self.label_top_value:.4f}"))


    def draw(self, screenwidth, screenheight, settings):
        self.program.use()

        glBindVertexArray(self.vao)
        self.program.uniformf("screenwidth", screenwidth)
        self.program.uniformf("screenheight", screenheight)
        self.program.uniformf("gamma", settings["gamma"])
        
        glDrawArrays(GL_TRIANGLES, 0, 6)

        glBindVertexArray(GL_NONE)
        self.program.unuse()

        #render labels

        self.label_bottom_pos = screenheight / 2
        self.label_top_pos = screenheight - 40


        self.updateLabels(settings)
        for i, t in self.labels:
            fac = i / (len(self.labels) - 1)
            t.renderText(50, fac * self.label_bottom_pos + (1 - fac) * self.label_top_pos, screenwidth, screenheight)

            