'use strict';

class BoxProgram extends Program {
    constructor(gl) {
        super(gl);
        DataManager.files({
            files: [
                Shader.dir + 'box_vs.glsl',
                Shader.dir + 'box_fs.glsl',
            ],
            success: (f) => {
                    this.init(...f)
                    this.setup();
                },
            fail: (r) => { console.error(r); },
            });
    }

    setup(){
        this.setupAttributes({
            position: 'vertPosition',
        });

        this.commonUniforms();
    }

    bindAttrPosition(options) {
        this.gl.useProgram(this.program);
        this.bindAttribute({
            attribute: this.attributes.position,
            size: 3,
            stride: 3 * Float32Array.BYTES_PER_ELEMENT,
            offset: 0,
        });
        this.gl.useProgram(null);
    }
}