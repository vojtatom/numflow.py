'use strict';

class GlyphProgram extends Program {
    constructor(gl) {
        if(!BoxProgram.instance){
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

            GlyphProgram.instance = this;
        }
        
        return GlyphProgram.instance;
    }

    setup(){
        this.setupAttributes({
            position: 'vertPosition',
			glyphPos: 'glyphPosition',
			fieldVal: 'fieldVector',
        });

        this.setupUniforms({
            model: 'mWorld',
			view: 'mView',
			proj: 'mProj',
			median: 'medianSize',
			std: 'devSize',
			size: 'glyphSize',
			layer: 'layer',
			brightness: 'brightness',
        });
    }

    setGlyphPositionAttrs(){
        //this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.attributes.glyphPos);
        this.gl.vertexAttribPointer(this.attributes.glyphPos, 3, this.gl.FLOAT, this.gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
        this.gl.vertexAttribDivisor(this.attributes.glyphPos, 1);
        //this.gl.useProgram(null);
    }

    setValueAttrs(){
        //this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.attributes.fieldVal);
        this.gl.vertexAttribPointer(this.attributes.fieldVal, 3, this.gl.FLOAT, this.gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
        this.gl.vertexAttribDivisor(this.attributes.fieldVal, 1);
        //this.gl.useProgram(null);
    }

    setVertexPositionAttrs(){
        //this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.attributes.position);
        this.gl.vertexAttribPointer(this.attributes.position, 3, this.gl.FLOAT, this.gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
        //this.gl.useProgram(null);
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