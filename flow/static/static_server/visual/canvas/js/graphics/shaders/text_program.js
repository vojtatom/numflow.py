'use strict';

class TextProgram extends Program {
    constructor(gl) {
        super(gl);
        DataManager.files({
            files: [
                Shader.dir + 'text_vs.glsl',
                Shader.dir + 'text_fs.glsl',
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
            texcoord: 'texcoord',
        });

        this.commonUniforms();
        this.setupUniforms({
            texture: {
                name: 'texture',
                type: this.GLType.int,
            },
            labelSize: {
                name: 'labelSize',
                type: this.GLType.vec2,
            },
            screenSize: {
                name: 'screenSize',
                type: this.GLType.vec2,
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

    bindAttrTexcoord() {
        this.gl.useProgram(this.program);
        this.bindAttribute({
            attribute: this.attributes.texcoord,
            size: 2,
            stride: 2 * Float32Array.BYTES_PER_ELEMENT,
            offfset: 0,
        });        
        this.gl.useProgram(null);
    }
}