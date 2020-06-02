import os

import numpy as np
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *

from .program import Program


class Context:
    def __init__(self, application):
        self.app = application
        self.boxProgram = 0
        self.glyphProgram = 0

        #self.initPrograms(vert, frag)
        #self.initBuffers();

        name = b'Nice little window'

        glutInit()
        glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH)
        glutInitWindowSize(512, 512)
        glutCreateWindow(name)
        glutDisplayFunc(self.frame)
        glutReshapeFunc(self.resize)

        #compiles programs, sets attributes, uniforms
        self.setupPrograms()


    def runLoop(self):
        #init global GL settings
        glClearColor(0., 0., 0., 1.)
        glEnable(GL_BLEND)
        glEnable(GL_DEPTH_TEST)
        glutMainLoop()


    def frame(self):
        glClear(GL_COLOR_BUFFER_BIT|GL_DEPTH_BUFFER_BIT)
        #draw geometry

        self.app.draw()

        #done drawing
        glutSwapBuffers()
        glutPostRedisplay()


    def resize(self, w, h):
        if self.app.camera == None:
            self.app.camera.resize(w, h)

    def setupPrograms(self):
        basepath = os.path.dirname(os.path.abspath(__file__))
        shaderfolder = 'shaders'
        basepath = os.path.join(basepath, shaderfolder)
        path = lambda shader: os.path.join(basepath, shader)

        #box program
        self.boxProgram = Program(path("box.vert"), path("box.frag"))
        self.boxProgram.use()
        self.boxProgram.addAttribute("pos")
        self.boxProgram.addUniform("low")
        self.boxProgram.addUniform("high")

        #glyph program setup
        self.glyphProgram = Program(path("glyph.vert"), path("glyph.frag"))
        self.glyphProgram.use()
        self.glyphProgram.addAttribute("position")
        self.glyphProgram.addAttribute("normal")
        self.glyphProgram.addAttribute("fvalues")
        self.glyphProgram.addAttribute("shift")


    #def drawCut( self, positions, values, sampling, normal ):
    #    # sampling = [sx,sy,sz],  normal = axis: 0/1/2 
    #    elements = self.G.layerElements(sampling, normal)
    #    # setup vao
    #    vao = glGenBuffers(1)
    #    glBindBuffer(GL_ARRAY_BUFFER, vao)
    #        
    #    # positions
    #    posvbo = glGenBuffers(1)
    #    glBindBuffer(GL_ARRAY_BUFFER, posvbo)
    #    glBufferData(GL_ARRAY_BUFFER, positions.nbytes, positions, GL_STATIC_DRAW)
    #
    #    glVertexAttribPointer(self.posloc, 3, GL_FLOAT, GL_FALSE, 0, None)
    #    # values
    #    valvbo = glGenBuffers(1)
    #    glBindBuffer(GL_ARRAY_BUFFER, valvbo)
    #    glBufferData(GL_ARRAY_BUFFER, values.nbytes, values, GL_STATIC_DRAW)
    #    glVertexAttribPointer(self.valloc, 3, GL_FLOAT, GL_FALSE, 0, None)
    #    # elements 
    #    ebo = glGenBuffers(1)
    #    glBindBuffer(GL_ARRAY_BUFFER, ebo)
    #    #glBufferData(GL_ARRAY_BUFFER, elements.nbytes, elements, GL_STATIC_DRAW)
    #    # ????
