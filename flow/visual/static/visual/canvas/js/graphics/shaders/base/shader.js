'use strict';

class Shader {
    constructor(gl, code, type){
        this.type = type;
        this.gl = gl;
        this.code = code;
        this.createShader();

    }

    createShader() {
        let type;
        if (this.type == Shader.type.vertex)
            type = this.gl.VERTEX_SHADER;
        else 
            type = this.gl.FRAGMENT_SHADER;

		this.shader = this.gl.createShader(type);
		this.gl.shaderSource(this.shader, this.code);

		this.gl.compileShader(this.shader);
		if (!this.gl.getShaderParameter(this.shader, this.gl.COMPILE_STATUS)) {
            console.error('ERROR compiling shader!', this.gl.getShaderInfoLog(this.shader));
            console.error(this.code);
			throw 'ERROR compiling shader!';
        }
    }
    
    static get type() {
        return ShaderType;
    }

    static get dir() {
        return '/static/visual/canvas/js/graphics/shaders/src/';
    }
}