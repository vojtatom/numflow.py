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
        glyph_normals = np.ascontiguousarray(glyphNormCone(), dtype=np.float32) # normals of a glyph
        positions = np.ascontiguousarray(positions.flatten(), dtype=np.float32)
        values = np.ascontiguousarray(values.flatten(), dtype=np.float32)
        #print(glyph_vertices)

        self.numverts = int(glyph_vertices.shape[0] / 3)
        #print(self.numverts)
        self.numglyphs = int(positions.shape[0])

        self.vao = glGenVertexArrays(1)
        glBindVertexArray(self.vao)

        # glyph vertices
        self.vbo = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, self.vbo)
        print(glyph_vertices.nbytes)
        glBufferData(GL_ARRAY_BUFFER, glyph_vertices.nbytes, glyph_vertices, GL_STATIC_DRAW)

        self.program.use()
        #print("program pos", self.program.attributes, self.vao)
        glEnableVertexAttribArray(program.attr("pos"))
        glVertexAttribPointer(program.attr("pos"), 3, GL_FLOAT, GL_FALSE, 0, None)

        # glyph normals
        self.nbuf = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, self.nbuf)
        glBufferData(GL_ARRAY_BUFFER, glyph_normals.nbytes, glyph_normals, GL_STATIC_DRAW)
        glEnableVertexAttribArray(program.attr("normal"))
        glVertexAttribPointer(program.attr("normal"), 3, GL_FLOAT, GL_FALSE, 0, None)
        
        
        # -------------------------------------------------------------------------
        # positions
        self.posvbo = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, self.posvbo)
        glBufferData(GL_ARRAY_BUFFER, positions.nbytes, positions, GL_STATIC_DRAW)
        glEnableVertexAttribArray(program.attr("shift"))
        glVertexAttribPointer(program.attr("shift"), 3, GL_FLOAT, GL_FALSE, 0, None)
        glVertexAttribDivisor(program.attr("shift"), 1)

        # values
        self.valvbo = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, self.valvbo)
        glBufferData(GL_ARRAY_BUFFER, values.nbytes, values, GL_STATIC_DRAW)
        glEnableVertexAttribArray(program.attr("fvalues"))
        glVertexAttribPointer(program.attr("fvalues"), 3, GL_FLOAT, GL_FALSE, 0, None)
        glVertexAttribDivisor(program.attr("fvalues"), 1)

        glBindVertexArray(GL_NONE)
        self.program.unuse()

    def draw(self, view, projection, settings):
        #setup projection matrices
        self.program.use()

        glBindVertexArray(self.vao)
        glBindBuffer(GL_ARRAY_BUFFER, self.vbo)
        glBindBuffer(GL_ARRAY_BUFFER, self.posvbo)
        glBindBuffer(GL_ARRAY_BUFFER, self.valvbo)

        self.program.setupBeforeDraw(view, projection, settings)

        #glDrawArrays(GL_TRIANGLES, 0, 60)
        glDrawArraysInstanced(GL_TRIANGLES, 0, self.numverts, self.numglyphs)

        glBindVertexArray(GL_NONE)
        self.program.unuse()
