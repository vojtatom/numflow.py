from OpenGL.GLUT import *
from OpenGL.GLU import *
from OpenGL.GL import *

import numpy as np

from .geometry import streamVert, streamNorm, streamLocalT
from .primitives import Primitive


class Streamline:
    def __init__(self, program, positions, values, lengths, times):
        self.program = program


        #init buffers/geometry
        positions = np.ascontiguousarray(positions.flatten(), dtype=np.float32)
        values = np.ascontiguousarray(values.flatten(), dtype=np.float32)
        times = np.ascontiguousarray(times.flatten(), dtype=np.float32)
        lengths = np.ascontiguousarray(lengths.flatten(), dtype=np.int32)
        
        #number of streamline segments (line glyphs)
        segmentsCount = times.shape[0] - lengths.shape[0]
        streamsCount = lengths.shape[0]
        filled = 0
        segsize = 28


        self.vao = glGenVertexArrays(1)
        glBindVertexArray(self.vao)
            
        #glyph positions
        self.streambuffer = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, self.streambuffer)
        glBufferData(GL_ARRAY_BUFFER, segmentsCount * segsize * 4, None, GL_STATIC_DRAW)


        #offset in positions and values array
        poffset = 0
        voffset = 0
        #offset in time array
        toffset = 0

        def copyVector(invec, outvec, inoffset, outoffset, veclen):
            for vi in range(veclen):
                outvec[outoffset + vi] = invec[inoffset + vi]

        #setup each streamline
        for i in range(streamsCount):
            if lengths[i] == 0:
                continue

            #lengths[i] - 1 == segment count
            buffer = np.zeros(((lengths[i] - 1) * segsize,), dtype=np.float32)
            streamLength = lengths[i]
            streamSegments = streamLength - 1
            #offset in buffer
            boffset = 0

            zeroPosition = []
            zeroValue = []
            finalPosition = []
            finalValue = []

            #for multiusage
            tmpoffset = None

            #extrapolate positions and values of the first
            for o in range(3):
                #offset of the first vertex
                tmpoffset = poffset + o
                zeroPosition.append(positions[tmpoffset] + (positions[tmpoffset] - positions[tmpoffset + 3]))
                zeroValue.append(values[tmpoffset] + (values[tmpoffset] - values[tmpoffset + 3]))

            #extrapolate positions and values of the last
            for o in range(3):
                #offset of the last vertex
                tmpoffset = poffset + o + (streamLength - 1) * 3
                #minus 3 to get last-but-one
                finalPosition.append(positions[tmpoffset] + (positions[tmpoffset] - positions[tmpoffset - 3]))
                finalValue.append(values[tmpoffset] + (values[tmpoffset] - values[tmpoffset - 3]))

            zeroTime = times[toffset] + (times[toffset] - times[toffset + 1])
            finalTime = times[toffset + streamLength - 1] + (times[toffset + streamLength - 1] - times[toffset + streamLength - 2])

            #setup each segment with structure:
            #
            # ...|p0 xyz|p1 xyz|p2 xyz|p3 xyz|v0 xyz|v1 xyz|v2 xyz|v3 xyz|t0123|...
            #     0      3      6      9      12     15     18     21     24
            # 
            # positions and values with stride 25
            # time with stride 24 
            #
            for s in range(streamSegments):
                #each slice of position and value
                #copy them at once
                for p in range(4):
                    if (s == 0) and (p == 0):
                        #copy first
                        copyVector(zeroPosition, buffer, 0, boffset, 3)
                        copyVector(zeroValue, buffer, 0, boffset + 12, 3)
                        buffer[boffset + 24] = zeroTime
                    elif (s == (streamSegments - 1)) and (p == 3): 
                        #copy last
                        copyVector(finalPosition, buffer, 0, boffset + 9, 3)
                        copyVector(finalValue, buffer, 0, boffset + 21, 3)
                        buffer[boffset + 27] = finalTime
                    else:
                        #copy any other
                        copyVector(positions, buffer, poffset, boffset + 3 * p, 3)
                        copyVector(values, buffer, voffset, boffset + 12 + 3 * p, 3)
                        buffer[boffset + 24 + p] = times[toffset]

                        #move head over what was read
                        voffset += 3
                        poffset += 3
                        toffset += 1

                #move 3 slides back (one window is 4 slides)
                boffset += 28
                voffset -= 9
                poffset -= 9
                toffset -= 3
            
            #move 3 slides forward
            poffset += 9
            voffset += 9
            toffset += 3

            #append to buffer 
            glBufferSubData(GL_ARRAY_BUFFER, filled, buffer)
            filled += buffer.shape[0] * 4
            buffer = None


        #setup attributes all on the same buffer
        self.program.use()
        glEnableVertexAttribArray(program.attr("fieldPosition0"))
        glVertexAttribPointer(program.attr("fieldPosition0"), 3, GL_FLOAT, GL_FALSE, 28 * 4, None)
        glVertexAttribDivisor(program.attr("fieldPosition0"), 1)
        glEnableVertexAttribArray(program.attr("fieldPosition1"))
        glVertexAttribPointer(program.attr("fieldPosition1"), 3, GL_FLOAT, GL_FALSE, 28 * 4, 3 * 4)
        glVertexAttribDivisor(program.attr("fieldPosition1"), 1)
        glEnableVertexAttribArray(program.attr("fieldPosition2"))
        glVertexAttribPointer(program.attr("fieldPosition2"), 3, GL_FLOAT, GL_FALSE, 28 * 4, 6 * 4)
        glVertexAttribDivisor(program.attr("fieldPosition2"), 1)
        glEnableVertexAttribArray(program.attr("fieldPosition3"))
        glVertexAttribPointer(program.attr("fieldPosition3"), 3, GL_FLOAT, GL_FALSE, 28 * 4, 9 * 4)
        glVertexAttribDivisor(program.attr("fieldPosition3"), 1)
        glEnableVertexAttribArray(program.attr("fieldValue0"))
        glVertexAttribPointer(program.attr("fieldValue0"), 3, GL_FLOAT, GL_FALSE, 28 * 4, 12 * 4)
        glVertexAttribDivisor(program.attr("fieldValue0"), 1)
        glEnableVertexAttribArray(program.attr("fieldValue1"))
        glVertexAttribPointer(program.attr("fieldValue1"), 3, GL_FLOAT, GL_FALSE, 28 * 4, 15 * 4)
        glVertexAttribDivisor(program.attr("fieldValue1"), 1)
        glEnableVertexAttribArray(program.attr("fieldValue2"))
        glVertexAttribPointer(program.attr("fieldValue2"), 3, GL_FLOAT, GL_FALSE, 28 * 4, 18 * 4)
        glVertexAttribDivisor(program.attr("fieldValue2"), 1)
        glEnableVertexAttribArray(program.attr("fieldValue3"))
        glVertexAttribPointer(program.attr("fieldValue3"), 3, GL_FLOAT, GL_FALSE, 28 * 4, 21 * 4)
        glVertexAttribDivisor(program.attr("fieldValue3"), 1)
        #glEnableVertexAttribArray(program.attr("t_global"))
        #glVertexAttribPointer(program.attr("t_global"), 3, GL_FLOAT, GL_FALSE, 28 * 4, 24 * 4)
        #glVertexAttribDivisor(program.attr("t_global"), 1)

        self.instances = int(segmentsCount)

        #init segment
        sampling = 4
        divisions = 4
        vert = streamVert(sampling, divisions)
        norm = streamNorm(sampling, divisions)
        t = streamLocalT(sampling, divisions)

        #init VBO for stream positions
        self.posvbo = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, self.posvbo)
        glBufferData(GL_ARRAY_BUFFER, vert.nbytes, vert, GL_STATIC_DRAW)

        glEnableVertexAttribArray(program.attr("vertPos"))
        glVertexAttribPointer(program.attr("vertPos"), 3, GL_FLOAT, GL_FALSE, 0, None)


        #init VBO for stream normals
        self.normvbo = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, self.normvbo)
        glBufferData(GL_ARRAY_BUFFER, norm.nbytes, norm, GL_STATIC_DRAW)

        glEnableVertexAttribArray(program.attr("vertNormal"))
        glVertexAttribPointer(program.attr("vertNormal"), 3, GL_FLOAT, GL_FALSE, 0, None)

        #init VBO for stream local time
        self.timevbo = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, self.timevbo)
        glBufferData(GL_ARRAY_BUFFER, t.nbytes, t, GL_STATIC_DRAW)

        glEnableVertexAttribArray(program.attr("t_local"))
        glVertexAttribPointer(program.attr("t_local"), 3, GL_FLOAT, GL_FALSE, 0, None)


        self.instanceSize = int(vert.shape[0] / 3)


        glBindVertexArray(GL_NONE)
        self.program.unuse()


    def draw(self, view, projection, settings):
        self.program.use()

        glBindVertexArray(self.vao)
        self.program.setupBeforeDraw(view, projection, settings)

        glDrawArraysInstanced(GL_TRIANGLES, 0, self.instanceSize, self.instances)

        glBindVertexArray(GL_NONE)
        self.program.unuse()