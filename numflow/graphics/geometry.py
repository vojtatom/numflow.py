import math
import numpy as np

def glyphVertCone(sampling=10):
    vert = []
    add = 2 * math.pi / sampling
    size = 0.5
    
    i = 0
    while i < 2 * math.pi:
        vert.extend([0, size * math.cos(i), size * math.sin(i)])
        vert.extend([0, size * math.cos(i + add), size * math.sin(i + add)])
        vert.extend([size * 2, 0, 0])
        i += add
    
    i = 0
    while i < 2 * math.pi:
        vert.extend([0, size * math.cos(i + add), size * math.sin(i + add)])
        vert.extend([0, size * math.cos(i), size * math.sin(i)])
        vert.extend([0, 0, 0])
        i += add

    return np.ascontiguousarray(np.array(vert), dtype=np.float32)


def glyphNormCone(sampling=10):
    vert = []
    add = 2 * math.pi / sampling
    t = np.array((2, 0, 0))

    i = 0
    while i < 2 * math.pi:
        a = np.array((0, math.cos(i), math.sin(i)))
        b = np.array((0, math.cos(i + add), math.sin(i + add)))
        x = a - t
        y = b - t
        c = np.cross(x, y)
        i += add

        for k in range(3):
            vert.extend([c[0], c[1], c[2]])

    i = 0
    while i < 2 * math.pi:
        for k in range(3):
            vert.extend([-1, 0, 0])
        i += add

    return np.array(vert, dtype=np.float32)


def glyphVertLine(sampling, height=4):
    vert = []
    add = 2 * math.pi / sampling 
    size = 0.5 

    i = 0
    while i < 2 * math.pi:
        vert.extend([0, size * math.cos(i), size * math.sin(i)]) 
        vert.extend([0, size * math.cos(i + add), size * math.sin(i + add)]) 
        vert.extend([size * height, size * math.cos(i), size * math.sin(i)]) 

        vert.extend([0, size * math.cos(i + add), size * math.sin(i + add)]) 
        vert.extend([size * height, size * math.cos(i + add), size * math.sin(i + add)]) 
        vert.extend([size * height, size * math.cos(i), size * math.sin(i)]) 
        i += add
    
    i = 0
    while i < 2 * math.pi:
        vert.extend([0, size * math.cos(i + add), size * math.sin(i + add)]) 
        vert.extend([0, size * math.cos(i), size * math.sin(i)]) 
        vert.extend([0, 0, 0]) 
        i += add
    
    i = 0
    while i < 2 * math.pi:
        vert.extend([size * height, size * math.cos(i), size * math.sin(i)]) 
        vert.extend([size * height, size * math.cos(i + add), size * math.sin(i + add)]) 
        vert.extend([size * height, 0, 0]) 
        i += add
    
    return vert 


def glyphNormLine(sampling, height=4):
    vert = [] 
    add = 2 * math.pi / sampling
    t = np.array((0, 0, 0))

    i = 0
    while i < 2 * math.pi:
        a = np.array((0, math.cos(i), math.sin(i)))
        b = np.array((0, math.cos(i + add), math.sin(i + add)))
        t = np.array((height, math.cos(i), math.sin(i)))
        x = a - t
        y = b - t 
        c = np.cross(x, y) 
        i += add

        for k in range(6):
            vert.extend([c[0], c[1], c[2]]) 
        
    i = 0
    while i < 2 * math.pi:
        for k in range(3):
            vert.extend([-1, 0, 0]) 
        i += add
    
    i = 0
    while i < 2 * math.pi:
        for k in range(3):
            vert.extend([1, 0, 0])
        i += add

    return vert 


def streamVert(sampling, divisions=10):
    vert = [] 

    for i in range(divisions):
        vert.extend(glyphVertLine(sampling, 0)) 

    return vert 

def streamNorm(sampling, divisions=10):
    vert = [] 

    for i in range(divisions):
        vert.extend(glyphNormLine(sampling, 1)) 
    
    return vert


def streamLocalT(sampling, divisions=10):
    vert = [] 
    add = 2 * math.pi / sampling 

    for i in range(divisions):
        base = i / divisions 
        top = (i + 1) / divisions 

        i = 0
        while i < 2 * math.pi:
            vert.extend([base, base, top, base, top, top]) 
            i += add
            
        i = 0
        while i < 2 * math.pi:
            vert.extend([base, base, base]) 
            i += add
    
        i = 0
        while i < 2 * math.pi:
            vert.extend([top, top, top]) 
            i += add
        
    return vert


def layerElements(sampling, normal):
    del sampling[normal]

    elements = [] 
    for b in range(0, int(sampling[1] - 1)): 
        for a in range(0, int(sampling[0] - 1)): 
            elements.extend([a + 1 + b * sampling[0], a + b * sampling[0], a + sampling[0] + b * sampling[0]]) 
            elements.extend([a + 1 + b * sampling[0], a + sampling[0] + b * sampling[0], a + 1 + sampling[0] + b * sampling[0]]) 

    return elements 


def colorbar(length):
    vert = [] 
    x = 1 

    for i in range(length - 1):
        vert.extend([0, i, 0]) 
        vert.extend([0, i - 1, 0]) 
        vert.extend([x, i, 0]) 

        vert.extend([x, i, 0]) 
        vert.extend([0, i - 1, 0]) 
        vert.extend([x, i - 1, 0]) 
    
    return vert 


def unitQuad():
    return [-0.5, -0.5, 0,
        0.5, -0.5, 0,
        0.5, 0.5, 0,
        -0.5, -0.5, 0,
        0.5, 0.5, 0,
        -0.5, 0.5, 0,]


def unitQuadTex():
    return [0, 1,
        1, 1,
        1, 0,
        0, 1,
        1, 0,
        0, 0,]


def generateBox():
    return np.array([
        0, 0, 0,
        0, 0, 1,

        0, 0, 1,
        0, 1, 1,

        0, 1, 1,
        0, 1, 0,

        0, 1, 0,
        0, 0, 0,

        0, 0, 0,
        1, 0, 0,

        0, 0, 1,
        1, 0, 1,

        0, 1, 1,
        1, 1, 1,

        0, 1, 0,
        1, 1, 0,

        1, 0, 0,
        1, 0, 1,

        1, 0, 1,
        1, 1, 1,

        1, 1, 1,
        1, 1, 0,

        1, 1, 0,
        1, 0, 0
    ], dtype=np.float32)