'use strict';

class MethodProgram extends Program {
    commonUniforms() {
        super.commonUniforms();
        this.setupUniforms({
            //lights
            light: {
                name: 'light',
                type: this.GLType.vec3,
            },
            //colormap
            colorMapSize: {
                name: 'colorMapSize',
                type: this.GLType.int, 
            },
            colorMap0: {
                name: 'colorMap[0]',
                type: this.GLType.vec4,
            },
            colorMap1: {
                name: 'colorMap[1]',
                type: this.GLType.vec4,
            },
            colorMap2: {
                name: 'colorMap[2]',
                type: this.GLType.vec4,
            },
            colorMap3: {
                name: 'colorMap[3]',
                type: this.GLType.vec4,
            },
            colorMap4: {
                name: 'colorMap[4]',
                type: this.GLType.vec4,
            },

            //stats
            minSize: {
                name: 'minSize',
                type: this.GLType.float,
            },
            maxSize: {
                name: 'maxSize',
                type: this.GLType.float,   
            },
            medianSize: {
                name: 'medianSize',
                type: this.GLType.float,
            },
            meanSize: {
                name: 'meanSize',
                type: this.GLType.float,
            },
            stdSize: {
                name: 'stdSize',
                type: this.GLType.float,
            },

            //scale and shift
            scaleFactor: {
                name: 'scaleFactor',
                type: this.GLType.float,
            },
            shift: {
                name: 'shift',
                type: this.GLType.vec3,
            },

            //world settings
            light: {
                name: 'light',
                type: this.GLType.vec3,
            },

            //geometry
            brightness: {
                name: 'brightness',
                type: this.GLType.float,
            },

            appearance: {
                name: 'appearance',
                type: this.GLType.int,
            },
        });
    }
}