import os
import pygame
from imageio import imwrite

import numpy as np
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
#from OpenGL.GLUT.freeglut import *

from .program import Program
from .text import Text
from .glyphs import Glyphs


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

        self.boxsides = { 0:"left", 1:"bottom", 2:"back", 3:"right", 4:"top", 5:"front" }
        self.text = Text("selection side: left - move M/N, change side S")
        self.textGamma = Text("gamma 1.0 - change U/I")
        self.textSave = Text("save screenshot C")
        self.textResize = Text("scale glyphs R")
        self.viewText = Text("top view 7 - side view 3 - front view 1")

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
            
            glEnable(GL_DEPTH_TEST)
            glDepthMask(True)
            
            glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
            
            glDisable(GL_BLEND)
            glBlendFunc(GL_SRC_ALPHA, GL_ONE)
            #glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_DST_ALPHA)

            self.app.draw_opaque()
            
            glEnable(GL_BLEND)
            glDepthMask(False)
            
            self.app.draw_transparent()

            glDisable(GL_DEPTH_TEST)
            glDisable(GL_BLEND)

            self.app.draw_colorbar()

            self.text.renderText(0, 0, self.app.camera.width, self.app.camera.height)
            self.textGamma.renderText(0, 20, self.app.camera.width, self.app.camera.height)
            self.textSave.renderText(0, 40, self.app.camera.width, self.app.camera.height)
            self.textResize.renderText(0, 60, self.app.camera.width, self.app.camera.height)
            self.viewText.renderText(0, 80, self.app.camera.width, self.app.camera.height)
            
            glutSwapBuffers()
            self.doDrawing = False


    def switchSides(self):
        # cycle selection box sides
        self.app.selection.changeSel()
        self.text.updateText("selection side: " + self.boxsides[self.app.selection.sel] + " - move M/N, change side S")
        self.redraw()
        

    def moveSides(self, key):
        if key == b'm': # expand side
            self.app.selection.expand()
        if key == b'n': # contract side
            self.app.selection.contract()
        self.redraw()

    def resize(self, w, h):
        if self.app.camera != None:
            self.app.camera.resize(w, h)
        glViewport(0, 0, w, h)
        self.redraw()


    def onMouse(self, button, state, x, y):
        #left button
        if button == 0:
            self.mouseDown = (state == 0)
        elif button == 4: #wheel up
            self.app.camera.zoom_out()
            self.redraw()
        elif button == 3: #wheel down
            self.app.camera.zoom_in()
            self.redraw()

    def onMove(self, x, y):
        if self.app.camera != None and self.mouseDown:
            self.app.camera.rotate(x - self.mousePos[0], y - self.mousePos[1])
            self.redraw()
        self.mousePos = [x, y]
        

    def onKey(self, key, x, y):
        self.keymap[key] = True

        if key == b'1':
            self.app.camera.front()
        if key == b'3':
            self.app.camera.side()
        if key == b'7':
            self.app.camera.top()
        if key == b'c':
            self.saveScreen()

        if key == b'u':
            self.app.gamma_up()
        if key == b'i':
            self.app.gamma_down()
        if key == b'r':
            #hotfix resize on r
            Glyphs.resize = not Glyphs.resize

        if key == b's':
            self.switchSides()
        if key == b'm' or key == b'n':
            self.moveSides(key)


        self.redraw()



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
        self.boxProgram.addUniform("view")
        self.boxProgram.addUniform("projection")

        #glyph program setup
        self.glyphProgram = Program(path("glyph.vert"), path("glyph.frag"))
        self.glyphProgram.use()
        self.glyphProgram.addAttribute("pos")
        self.glyphProgram.addAttribute("normal")
        self.glyphProgram.addAttribute("fvalues")
        self.glyphProgram.addAttribute("shift")
        self.glyphProgram.addUniform("amin")
        self.glyphProgram.addUniform("amax")
        self.glyphProgram.addUniform("view")
        self.glyphProgram.addUniform("projection")
        self.glyphProgram.addUniform("size")
        self.glyphProgram.addUniform("transparency")
        self.glyphProgram.addUniform("selectedLow")
        self.glyphProgram.addUniform("selectedHigh")
        self.glyphProgram.addUniform("gamma")
        self.glyphProgram.addUniform("resize")

        #slice program setup
        self.sliceProgram = Program(path("slice.vert"), path("slice.frag"))
        self.sliceProgram.use()
        self.sliceProgram.addAttribute("pos")
        self.sliceProgram.addAttribute("fvalue")
        self.sliceProgram.addUniform("amin")
        self.sliceProgram.addUniform("amax")
        self.sliceProgram.addUniform("normal")
        self.sliceProgram.addUniform("view")
        self.sliceProgram.addUniform("projection")
        self.sliceProgram.addUniform("transparency")
        self.sliceProgram.addUniform("selectedLow")
        self.sliceProgram.addUniform("selectedHigh")
        self.sliceProgram.addUniform("gamma")

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
        self.streamlineProgram.addUniform("shadeMode")
        self.streamlineProgram.addUniform("view")
        self.streamlineProgram.addUniform("projection")
        self.streamlineProgram.addUniform("transparency")
        self.streamlineProgram.addUniform("selectedLow")
        self.streamlineProgram.addUniform("selectedHigh")
        self.streamlineProgram.addUniform("gamma")


        #colormap setup program
        self.colormapProgram = Program(path("colormap.vert"), path("colormap.frag"))
        self.colormapProgram.use()
        self.colormapProgram.addAttribute("pos")
        self.colormapProgram.addUniform("screenwidth")
        self.colormapProgram.addUniform("screenheight")
        self.colormapProgram.addUniform("gamma")


    def timer(self, value):
        glutPostRedisplay()
        glutTimerFunc(16, self.timer, value + 1)


    def saveScreen(self):

        pixel_data = np.zeros((3 * self.app.camera.width * self.app.camera.height), dtype=np.uint8)

        glReadBuffer(GL_FRONT)
        glReadPixels(0, 0, self.app.camera.width, self.app.camera.height, GL_BGR, GL_UNSIGNED_BYTE, pixel_data)
        glMemoryBarrier(GL_PIXEL_BUFFER_BARRIER_BIT)

        pixel_data = np.flip(np.flipud(pixel_data.reshape((self.app.camera.height, self.app.camera.width, 3))), 2)

        i = 0
        while True:
            if os.path.exists(f"screen{i}.png"):
                i += 1
                continue
            imwrite(f"screen{i}.png", pixel_data)
            return