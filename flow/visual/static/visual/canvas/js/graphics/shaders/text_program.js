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

        this.setupUniforms({
            model: 'mWorld',
            view: 'mView',
            proj: 'mProj',
            texture: 'texture',

            billSize: 'billSize',
            screenSize: 'screenSize',
        });
    }


    setAttrsPosition() {
        this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.attributes.position);
        this.gl.vertexAttribPointer(this.attributes.position, 3, this.gl.FLOAT, this.gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
        this.gl.useProgram(null);
    }

    setAttrsTexcoord() {
        this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.attributes.texcoord);
        this.gl.vertexAttribPointer(this.attributes.texcoord, 2, this.gl.FLOAT, this.gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
        this.gl.useProgram(null);
    }

    setUnifs(options) {
        this.gl.uniformMatrix4fv(this.uniforms.model, this.gl.FALSE, options.model);
        this.gl.uniformMatrix4fv(this.uniforms.view, this.gl.FALSE, options.view);
        this.gl.uniformMatrix4fv(this.uniforms.proj, this.gl.FALSE, options.projection);

        this.gl.uniform2fv(this.uniforms.billSize, options.size);
        this.gl.uniform2fv(this.uniforms.screenSize, options.screenSize);
        this.gl.uniform1i(this.uniforms.texture, options.texture);
    }
}