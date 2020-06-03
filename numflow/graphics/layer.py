import numpy as np
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *

from .geometry import layerElements

class Layer:
    def __init__(self, program, positions, values, resolution, axis_id, slice_coord):
        self.program = program
        print(program)

        layer_elements = np.ascontiguousarray(layerElements(resolution, axis_id), dtype=np.uint32) 
        positions =  np.ascontiguousarray(positions.flatten(), dtype=np.float32) 
        values =  np.ascontiguousarray(values.flatten(), dtype=np.float32) 

        self.numIndices = layer_elements.shape[0]
        
        self.vao = glGenVertexArrays(1)
        glBindVertexArray(self.vao)

        #buffers for positions
        self.vbopos = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, self.vbopos)
        glBufferData(GL_ARRAY_BUFFER, positions.nbytes, positions, GL_STATIC_DRAW)

        self.program.use()
        glEnableVertexAttribArray(program.attr("pos"))
        glVertexAttribPointer(program.attr("pos"), 3, GL_FLOAT, GL_FALSE, 0, None)

        #buffer for values
        self.vboval = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, self.vboval)
        glBufferData(GL_ARRAY_BUFFER, values.nbytes, values, GL_STATIC_DRAW)
        glEnableVertexAttribArray(program.attr("fvalue"))
        glVertexAttribPointer(program.attr("fvalue"), 3, GL_FLOAT, GL_FALSE, 0, None)

        #element buffer
        self.ebo = glGenBuffers(1)
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, self.ebo)
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, layer_elements.nbytes, layer_elements, GL_STATIC_DRAW)

        #prepare uniform normal
        self.normal = np.array([0, 0, 0], dtype=np.float32)
        self.normal[axis_id] = 1

        glBindVertexArray(GL_NONE)
        self.program.unuse()


    def draw(self, view, projection, settings):
        glDisable(GL_CULL_FACE)
        self.program.use()

        glBindVertexArray(self.vao)
        #glBindBuffer(GL_ARRAY_BUFFER, self.vbopos)
        #glBindBuffer(GL_ARRAY_BUFFER, self.vboval)
        #glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, self.ebo)

        self.program.setupBeforeDraw(view, projection, settings)
        self.program.uniformVec3f("normal", self.normal)

        #print("drawing elements")
        glDrawElements(GL_TRIANGLES, self.numIndices, GL_UNSIGNED_INT, None)
        #print("done drawing elements")

        glBindVertexArray(GL_NONE)
        self.program.unuse()
        glEnable(GL_CULL_FACE)