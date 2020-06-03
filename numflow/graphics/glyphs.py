import numpy as np
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *

from .geometry import glyphNormCone, glyphVertCone
from .primitives import Primitive


class Glyphs(Primitive):
    def __init__(self, program, positions, values):
        self.program = program

        glyph_vertices = np.ascontiguousarray(glyphVertCone(), dtype=np.float32) # vertices of a glyph
        #n = glyphNormCone() # normals of a glyph

        print(glyph_vertices)

        #self.numverts = int(v.shape[0]/3)
        #self.numglyphs = int(positions.shape[0])


        self.vao = glGenVertexArrays(1)
        glBindVertexArray(self.vao)

        # glyph vertices
        self.vbo = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, self.vbo)
        print(glyph_vertices.nbytes)
        glBufferData(GL_ARRAY_BUFFER, glyph_vertices.nbytes, glyph_vertices, GL_STATIC_DRAW)

        self.program.use()
        print("program pos", self.program.attributes)
        glEnableVertexAttribArray(self.program.attr("pos"))
        glVertexAttribPointer(self.program.attr("pos"), 3, GL_FLOAT, GL_FALSE, 0, None)

        # glyph normals
        #self.nbuf = glGenBuffers(1)
        #glBindBuffer(GL_ARRAY_BUFFER, self.nbuf)
        #glBufferData(GL_ARRAY_BUFFER, n.nbytes, n, GL_STATIC_DRAW)
        #glVertexAttribPointer(program.attr("normal"), 3, GL_FLOAT, GL_FALSE, 0, None)
        
        
        # -------------------------------------------------------------------------
        # positions
        #self.posvbo = glGenBuffers(1)
        #glBindBuffer(GL_ARRAY_BUFFER, self.posvbo)
        #glBufferData(GL_ARRAY_BUFFER, positions.nbytes, positions, GL_STATIC_DRAW)
        #glVertexAttribPointer(program.attr("shift"), 3, GL_FLOAT, GL_FALSE, 0, None)
        #glVertexAttribDivisor(program.attr("shift"), 1)

        # values
        #self.valvbo = glGenBuffers(1)
        #glBindBuffer(GL_ARRAY_BUFFER, self.valvbo)
        #glBufferData(GL_ARRAY_BUFFER, values.nbytes, values, GL_STATIC_DRAW)
        #glVertexAttribPointer(program.attr("fvalues"), 3, GL_FLOAT, GL_FALSE, 0, None)
        #glVertexAttribDivisor(program.attr("fvalues"), 1)

        glBindVertexArray(GL_NONE)
        self.program.unuse()

    def draw(self, projection, view):
        #setup projection matrices
        self.program.use()

        glBindVertexArray(self.vao)
        glBindBuffer(GL_ARRAY_BUFFER, self.vbo)

        self.program.setupViewProjection(view, projection)

        glDrawArrays(GL_TRIANGLES, 0, 60)
        #glDrawArraysInstanced(GL_TRIANGLES, 0, self.numverts, self.numglyphs)

        glBindVertexArray(GL_NONE)
        self.program.unuse()
