'use strict';

class LayerProgram extends MethodProgram {
    constructor(gl) {
        super(gl);
        DataManager.files({
            files: [
                Shader.dir + 'layer_vs.glsl',
                Shader.dir + 'layer_fs.glsl',
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
            fieldPos: 'fieldPosition',
            fieldVal: 'fieldValue',
        });

        this.commonUniforms();
        this.setupUniforms({
            normal: {
                name: 'normal',
                type: this.GLType.vec3,
            },
            cameraPosition: {
                name: 'cameraPosition',
                type: this.GLType.vec3,
            }
        });
    }

    bindAttrPosition() {
        this.gl.useProgram(this.program);
        this.bindAttribute({
            attribute: this.attributes.fieldPos,
            size: 3,
            stride: 3 * Float32Array.BYTES_PER_ELEMENT,
            offset: 0,
        });
        this.gl.useProgram(null);
    }

    bindAttrValue() {
        this.gl.useProgram(this.program);
        this.bindAttribute({
            attribute: this.attributes.fieldVal,
            size: 3,
            stride: 3 * Float32Array.BYTES_PER_ELEMENT,
            offset: 0,
        });
        this.gl.useProgram(null);
    }
}