import os
import pygame

import numpy as np
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
#from OpenGL.GLUT.freeglut import *

from .program import Program
from .text import Text


class Context:
    def __init__(self, application):
        self.app = application
        self.boxProgram = 0
        self.glyphProgram = 0
        
        #for text drawing
        pygame.font.init()

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
        self.resize(1920, 1080)

        self.text = Text("example")
        self.text2 = Text("example", color=[1, 0, 0])
        #compiles programs, sets attributes, uniforms
        self.setupPrograms()

        glFinish()


    def runLoop(self):
        #init global GL settings
        glutTimerFunc(16, self.timer, 0)
        glFinish()
        glClearColor(0., 0., 0., 1.)
        glEnable(GL_BLEND)
        glEnable(GL_DEPTH_TEST)
        glEnable(GL_CULL_FACE)
        glutMainLoop()


    def frame(self):
        #draw geometry
        if self.doDrawing:
            glFlush() 
            glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
            self.app.draw()

            self.text.renderText(0, 0, self.app.camera.width, self.app.camera.height)
            self.text2.renderText(0, 10, self.app.camera.width, self.app.camera.height)
            glutSwapBuffers()
            self.doDrawing = False

        #done drawing


    def resize(self, w, h):
        if self.app.camera != None:
            self.app.camera.resize(w, h)
        glViewport(0, 0, w, h)
        self.redraw()


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
        self.boxProgram.addUniform("color")

        #glyph program setup
        self.glyphProgram = Program(path("glyph.vert"), path("glyph.frag"))
        self.glyphProgram.use()
        self.glyphProgram.addAttribute("pos")
        self.glyphProgram.addAttribute("normal")
        self.glyphProgram.addAttribute("fvalues")
        self.glyphProgram.addAttribute("shift")
        self.glyphProgram.addUniform("amin")
        self.glyphProgram.addUniform("amax")

        #slice program setup
        self.sliceProgram = Program(path("slice.vert"), path("slice.frag"))
        self.sliceProgram.use()
        self.sliceProgram.addAttribute("pos")
        self.sliceProgram.addAttribute("fvalue")
        self.sliceProgram.addUniform("amin")
        self.sliceProgram.addUniform("amax")
        self.sliceProgram.addUniform("normal")

        #streamline setup program
        self.streamlineProgram = Program(path("streamline.vert"), path("streamline.frag"))
        self.streamlineProgram.use()
        self.streamlineProgram.addAttribute("vertPos")
        self.streamlineProgram.addAttribute("vertNormal")
        self.streamlineProgram.addAttribute("t_local")
        self.streamlineProgram.addAttribute("fieldPosition0")
        self.streamlineProgram.addAttribute("fieldPosition1")
        self.streamlineProgram.addAttribute("fieldPosition2")
        self.streamlineProgram.addAttribute("fieldPosition3")
        self.streamlineProgram.addAttribute("fieldValue0")
        self.streamlineProgram.addAttribute("fieldValue1")
        self.streamlineProgram.addAttribute("fieldValue2")
        self.streamlineProgram.addAttribute("fieldValue3")
        self.streamlineProgram.addAttribute("t_global")
        self.streamlineProgram.addUniform("amin")
        self.streamlineProgram.addUniform("amax")
        self.streamlineProgram.addUniform("thickness")
        self.streamlineProgram.addUniform("min_thresh")
        self.streamlineProgram.addUniform("max_thresh")



    def timer(self, value):
        glutPostRedisplay()
        glutTimerFunc(16, self.timer, value + 1)
