import os

import numpy as np
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
#from OpenGL.GLUT.freeglut import *

from .program import Program


class Context:
    def __init__(self, application):
        self.app = application
        self.boxProgram = 0
        self.glyphProgram = 0

        name = b'Nice little window'

        self.doDrawing = True
        self.mouseDown = False
        self.mousePos = [0, 0]
        self.keymap = {}

        glutInit()
        glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH)
        glutInitWindowSize(1920, 1080)
        glutCreateWindow(name)
        glutDisplayFunc(self.frame)
        glutReshapeFunc(self.resize)
        glutMouseFunc(self.onMouse)
        glutPassiveMotionFunc(self.onMove)
        glutMotionFunc(self.onMove)
        glutKeyboardFunc(self.onKey)
        glutKeyboardUpFunc(self.onKeyUp)
        glutTimerFunc(16, self.timer, 0)
        self.resize(1920, 1080)

        #compiles programs, sets attributes, uniforms
        self.setupPrograms()


    def runLoop(self):
        #init global GL settings
        glClearColor(0., 0., 0., 1.)
        #glEnable(GL_BLEND)
        #glEnable(GL_DEPTH_TEST)
        #glEnable(GL_CULL_FACE)
        glutMainLoop()


    def frame(self):
        #draw geometry
        if self.doDrawing:
            glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
            self.app.draw()

            glutSwapBuffers()
            self.doDrawing = False

        #done drawing


    def resize(self, w, h):
        if self.app.camera != None:
            self.app.camera.resize(w, h)
        glViewport(0, 0, w, h)


    def onMouse(self, button, state, x, y):
        #left button
        if button == 0:
            self.mouseDown = (state == 0)
        elif button == 3: #wheel up
            self.app.camera.zoom_out()
            self.redraw()
        elif button == 4: #wheel down
            self.app.camera.zoom_in()
            self.redraw()

    def onMove(self, x, y):
        if self.app.camera != None and self.mouseDown:
            self.app.camera.rotate(x - self.mousePos[0], y - self.mousePos[1])
            self.redraw()
        self.mousePos = [x, y]
        

    def onKey(self, key, x, y):
        self.keymap[key] = True


    def onKeyUp(self, key, x, y):
        self.keymap[key] = False


    def redraw(self):
        self.doDrawing = True


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
        self.glyphProgram.addAttribute("pos")
        #self.glyphProgram.addAttribute("normal")
        #self.glyphProgram.addAttribute("fvalues")
        #self.glyphProgram.addAttribute("shift")


    def timer(self, value):
        glutPostRedisplay()
        glutTimerFunc(16, self.timer, value + 1)


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
