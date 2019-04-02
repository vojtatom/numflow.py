'use strict';

class ColorbarProgram extends Program {
    constructor(gl) {
        super(gl);
        DataManager.files({
            files: [
                Shader.dir + 'colorbar_vs.glsl',
                Shader.dir + 'colorbar_fs.glsl',
            ],
            success: (f) => {
                this.init(...f)
                this.setup();
            },
            fail: (r) => { console.error(r); },
        });
    }

    setup() {
        this.setupAttributes({
            position: 'position',
        });

        this.commonUniforms();
        this.setupUniforms({
            barSize: {
                name: 'barSize',
                type: this.GLType.vec2,
            },

            barPos: {
                name: 'barPos',
                type: this.GLType.vec2,
            },

            screenSize: {
                name: 'screenSize',
                type: this.GLType.vec2,
            },

            minSize: {
                name: 'minSize',
                type: this.GLType.float,
            },
            maxSize: {
                name: 'maxSize',
                type: this.GLType.float,   
            },

            //colormap
            colorMapSize: {
                name: 'colorMapSize',
                type: this.GLType.int, 
            },
            colorMapSamples: {
                name: 'colorMapSamples',
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

            gamma: {
                name: 'gamma',
                type: this.GLType.float,
            },

            colorMode: {
                name: 'colorMode',
                type: this.GLType.int,
            },
        });
    }


    bindAttrPosition() {
        this.gl.useProgram(this.program);
        this.bindAttribute({
            attribute: this.attributes.position,
            size: 3,
            stride: 3 * Float32Array.BYTES_PER_ELEMENT,
            offfset: 0,
        });
        this.gl.useProgram(null);
    }
}