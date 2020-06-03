from OpenGL.GLUT import *
from OpenGL.GLU import *
from OpenGL.GL import *
import glm

import numpy as np
class Program:
    def __init__(self, vert_shader, frag_shader):
        self.program = glCreateProgram()

        vertex = glCreateShader(GL_VERTEX_SHADER)
        fragment = glCreateShader(GL_FRAGMENT_SHADER)
        
        # read shader files
        vertex_code = self.readShader(vert_shader)
        fragment_code = self.readShader(frag_shader)
        
        # shader source
        glShaderSource(vertex, vertex_code)
        glShaderSource(fragment, fragment_code)
        
        # compile shaders
        glCompileShader(vertex)
        if not glGetShaderiv(vertex, GL_COMPILE_STATUS):
            error = glGetShaderInfoLog(vertex).decode()
            print(error)
            raise RuntimeError(f"Error in vertex shader compilation: {vert_shader}")

        glCompileShader(fragment)    
        if not glGetShaderiv(fragment, GL_COMPILE_STATUS):
            error = glGetShaderInfoLog(fragment).decode()
            print(error)
            raise RuntimeError(f"Error in fragment shader compilation: {frag_shader}")

        # attach and link
        glAttachShader(self.program, vertex)
        glAttachShader(self.program, fragment)
        glLinkProgram(self.program)

        if not glGetProgramiv(self.program, GL_LINK_STATUS):
            print(glGetProgramInfoLog(self.program))
            raise RuntimeError(f"Linking error: {vert_shader} + {frag_shader}")
        
        glDetachShader(self.program, vertex)
        glDetachShader(self.program, fragment)

        self.attributes = {}
        self.uniforms = {}

        #autoadd matrix uniforms
        self.addUniform("view")
        self.addUniform("projection")


    def readShader(self, fname):
        shader = open(fname, 'r').read()
        return shader


    def addAttribute(self, name):
        aid = glGetAttribLocation(self.program, name)
        self.attributes[name] = aid


    def addUniform(self, name):
        uid = glGetUniformLocation(self.program, name)
        self.uniforms[name] = uid


    def use(self):
        glUseProgram(self.program)


    def unuse(self):
        glUseProgram(GL_NONE)


    def attr(self, name):
        return self.attributes[name]


    def unif(self, name):
        return self.uniforms[name]


    def setupViewProjection(self, viewMat, projectionMat):
        glUniformMatrix4fv(self.uniforms["view"], 1, GL_FALSE, glm.value_ptr(viewMat))
        glUniformMatrix4fv(self.uniforms["projection"], 1, GL_FALSE, glm.value_ptr(projectionMat))


    def uniformVec3f(self, name, value):
        glUniform3fv(self.unif(name), 1, value)

    
    def uniformf(self, name, value):
        glUniform1f(self.unif(name), value)