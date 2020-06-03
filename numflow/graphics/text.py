import pygame, numpy
from pygame.constants import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *

class Text:
	def __init__( self, text, fontsize, fontcolor ):
		pygame.init()
		self.initText(text, fontsize, fontcolor)
	

	def initText( self, mytext, fsize, color ):
		self.img = pygame.font.Font(None, fsize).render(mytext, True, (color[0] * 255, color[1] * 255, color[2] * 255))
		w, h = self.img.get_size()
		self.texture = glGenTextures(1)
		glPixelStorei(GL_UNPACK_ALIGNMENT, 1)
		glBindTexture(GL_TEXTURE_2D, self.texture)
		glTexParameter(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST)
		glTexParameter(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST)
		data = pygame.image.tostring(self.img, "RGBA", 1)
		glTexImage2D(GL_TEXTURE_2D, 0, 4, w, h, 0, GL_RGBA, GL_UNSIGNED_BYTE, data)


	def renderText( self, x0, y0 ):
		glBindTexture(GL_TEXTURE_2D, self.texture)
		glMatrixMode(GL_PROJECTION)
		glLoadIdentity()
		glTranslate(-1, -1, 0)
		ww = glutGet(GLUT_WINDOW_WIDTH)
		wh = glutGet(GLUT_WINDOW_HEIGHT)
		glScale(2 / ww, 2 / wh, 1)
		
		glEnable(GL_BLEND)
		glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)
		glEnable(GL_TEXTURE_2D)

		glBegin(GL_QUADS)
		w, h = self.img.get_size()
		for dx, dy in [(0, 0), (0, 1), (1, 1), (1, 0)]:
			glVertex(x0 + dx * w, y0 + dy * h, 0)
			glTexCoord(dy, 1 - dx)
		glEnd()
