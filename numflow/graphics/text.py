import pygame
import numpy

from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *

class Text:
	def __init__( self, mytext, fsize=15, color=[1, 1, 1] ):
		self.size = fsize
		self.color = color
		self.createTexture(mytext)


	def updateText(self, mytext):
		glDeleteTextures(1, GLuint(self.texture))
		self.createTexture(mytext)


	def createTexture(self, text):
		self.img = pygame.font.Font(None, self.size).render(text, True, (self.color[0] * 255, self.color[1] * 255, self.color[2] * 255))
		w, h = self.img.get_size()
		self.texture = glGenTextures(1)
		glPixelStorei(GL_UNPACK_ALIGNMENT, 1)
		glBindTexture(GL_TEXTURE_2D, self.texture)
		glTexParameter(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST)
		glTexParameter(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST)
		data = pygame.image.tostring(self.img, "RGBA", 1)
		glTexImage2D(GL_TEXTURE_2D, 0, 4, w, h, 0, GL_RGBA, GL_UNSIGNED_BYTE, data)


	def renderText(self, x0, y0, ww, wh):
		glBindTexture(GL_TEXTURE_2D, self.texture)
		
		glUseProgram(GL_NONE)
		glEnable(GL_BLEND)
		glDisable(GL_CULL_FACE)
		glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)
		glEnable(GL_TEXTURE_2D)

		glMatrixMode( GL_PROJECTION )
		glPushMatrix()
		glLoadIdentity()
		glOrtho( 0, ww, 0, wh, -1, 1 )
		#glMatrixMode( GL_MODELVIEW )
		#glPushMatrix()
		#glLoadIdentity()

		glBegin(GL_QUADS)
		w, h = self.img.get_size()
		for dx, dy in [(0, 0), (0, 1), (1, 1), (1, 0)]:
			glVertex(x0 + dx * w, y0 + dy * h)
			glTexCoord(dy, 1 - dx)
		glEnd()

		glEnable(GL_CULL_FACE)
		#glPopMatrix()
		#glMatrixMode( GL_PROJECTION )
		glPopMatrix()