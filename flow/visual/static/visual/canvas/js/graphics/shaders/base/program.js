'use strict';

class Program {
    constructor(gl) {
        this.gl = gl;

        this.state = {
            init: false,
            attrs: false,
            unifs: false,
        }

        this.loaded = false;
    }

    init(vs, fs) {
        this.vs = new Shader(this.gl, vs, Shader.type.vertex);
        this.fs = new Shader(this.gl, fs, Shader.type.fragement);

        this.createProgram();
        this.update('init');
    }

    createProgram() {
		let program = this.gl.createProgram();

		this.gl.attachShader(program, this.vs.shader);
		this.gl.attachShader(program, this.fs.shader);

		this.gl.linkProgram(program);
		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			console.error('ERROR linking program!', this.gl.getProgramInfoLog(program));
		}

		this.gl.validateProgram(program);
		if (!this.gl.getProgramParameter(program, this.gl.VALIDATE_STATUS)) {
			console.error('ERROR validating program!', this.gl.getProgramInfoLog(program));
        }

        this.program = program;
    }
    
    setupAttributes(attr) {
        this.attributes = {};

        for(let key in attr){
            this.attributes[key] = this.gl.getAttribLocation(this.program, attr[key]);
        }

        this.update('attrs');
    }

    setupUniforms(unif) {
        this.uniforms = {};

        for(let key in unif){
            this.uniforms[key] = this.gl.getUniformLocation(this.program, unif[key]);
        }  
            
        this.update('unifs');
    }

    bind() {
        this.gl.useProgram(this.program);
    }

    unbind() {
        this.gl.useProgram(null);
    }

    update(key){
        this.state[key] = true;
        if (this.state.init && this.state.attrs && this.state.unifs)
            this.loaded = true;
    }

    get attr() {
        return this.attributes;
    }

    get unif() {
        return this.uniforms;
    }
}