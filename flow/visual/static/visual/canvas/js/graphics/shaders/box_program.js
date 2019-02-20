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

        this.setupUniforms({
            model: 'mWorld',
			view: 'mView',
            proj: 'mProj',
            mode: 'mode',
        });
    }

    setAttrs(options) {
        this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.attributes.position);
        this.gl.vertexAttribPointer(this.attributes.position, 3, this.gl.FLOAT, this.gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
        this.gl.useProgram(null);
    }

    setUnifs(options) {
        this.gl.uniformMatrix4fv(this.uniforms.model, this.gl.FALSE, options.model);
        this.gl.uniformMatrix4fv(this.uniforms.view, this.gl.FALSE, options.view);
        this.gl.uniformMatrix4fv(this.uniforms.proj, this.gl.FALSE, options.projection);
        this.gl.uniform1i(this.uniforms.mode, options.mode);
    }
}