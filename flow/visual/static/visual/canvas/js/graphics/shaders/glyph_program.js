'use strict';

class GlyphProgram extends MethodProgram {
    constructor(gl) {
        super(gl);
        DataManager.files({
            files: [
                Shader.dir + 'glyph_vs.glsl',
                Shader.dir + 'glyph_fs.glsl',
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
            position: 'vertPosition',
            normal: 'vertNormal',
            fieldPos: 'fieldPosition',
            fieldVal: 'fieldValue',
        });

        this.commonUniforms();
        this.setupUniforms({
            size: {
                name: 'size',
                type: this.GLType.float,
            }
        });
    }

    bindAttrFieldPosition() {
        this.gl.useProgram(this.program);
        this.bindAttribute({
            attribute: this.attributes.fieldPos,
            size: 3,
            stride: 3 * Float32Array.BYTES_PER_ELEMENT,
            offset: 0,
            divisor: 1,
        });
        this.gl.useProgram(null);
    }

    bindAttrFieldValue() {
        this.gl.useProgram(this.program);
        this.bindAttribute({
            attribute: this.attributes.fieldVal,
            size: 3,
            stride: 3 * Float32Array.BYTES_PER_ELEMENT,
            offset: 0,
            divisor: 1,
        });
        this.gl.useProgram(null);
    }

    bindAttrVertexPosition() {
        this.gl.useProgram(this.program);
        this.bindAttribute({
            attribute: this.attributes.position,
            size: 3,
            stride: 3 * Float32Array.BYTES_PER_ELEMENT,
            offset: 0,
        });
        this.gl.useProgram(null);
    }

    bindAttrVertexNormal() {
        this.gl.useProgram(this.program);
        this.bindAttribute({
            attribute: this.attributes.normal,
            size: 3,
            stride: 3 * Float32Array.BYTES_PER_ELEMENT,
            offset: 0,
        });
        this.gl.useProgram(null);
    }
}