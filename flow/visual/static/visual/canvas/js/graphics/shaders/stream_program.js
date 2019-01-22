'use strict';

class StreamProgram extends Program {
    constructor(gl) {
        if(!StreamProgram.instance){
            super(gl);
            DataManager.files({
                files: [
                    Shader.dir + 'stream_vs.glsl',
                    Shader.dir + 'stream_fs.glsl',
                ],
                success: (f) => {
                        this.init(...f)
                        this.setup();
                    },
                fail: (r) => { console.error(r); },
                });

            StreamProgram.instance = this;
        }
        
        return StreamProgram.instance;
    }

    setup(){
        this.setupAttributes({
            position: 'position',
			velocity: 'velocity',
        });

        this.setupUniforms({
            model: 'mWorld',
			view: 'mView',
			proj: 'mProj',
			max: 'maxVel',
			median: 'medianVel',
			dev: 'absDevVel',
			brightness: 'brightness',
        });
    }


    setAttrs(){
        this.gl.useProgram(this.program);
        //this.gl.enableVertexAttribArray(this.attributes.position);
        //this.gl.vertexAttribPointer(this.attributes.position, 3, this.gl.FLOAT, this.gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
        this.gl.useProgram(null);
    }

    setUnifs(options) {
        this.gl.uniformMatrix4fv(this.uniforms.model, this.gl.FALSE, options.model);
        this.gl.uniformMatrix4fv(this.uniforms.view, this.gl.FALSE, options.view);
        this.gl.uniformMatrix4fv(this.uniforms.proj, this.gl.FALSE, options.projection);
        this.gl.uniform1f(this.uniforms.median, options.median);
        this.gl.uniform1f(this.uniforms.std, options.std);
        this.gl.uniform1f(this.uniforms.size, options.size);
        //this.gl.uniform1f(this.uniforms.layer, options.layer);
        this.gl.uniform1f(this.uniforms.brightness, options.brightness);
    }
}