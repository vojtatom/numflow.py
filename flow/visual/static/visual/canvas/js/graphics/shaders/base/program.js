'use strict';

class Program {
    constructor(gl) {
        this.gl = gl;

        this.state = {
            init: false,
            attrs: false,
            unifs: false,
        }

        this.GLType = {
            float: this.gl.uniform1f,
            int: this.gl.uniform1i,
            
            vec2: this.gl.uniform2fv,
            vec3: this.gl.uniform3fv, 
            vec4: this.gl.uniform4fv,
            
            mat4: this.gl.uniformMatrix4fv,
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
            this.uniforms[key] = {
                location: this.gl.getUniformLocation(this.program, unif[key].name),
                assignFunction: unif[key].type,
            } 
        }  
            
        this.update('unifs');
    }

    bindAttribute(set){
        this.gl.enableVertexAttribArray(set.attribute);
        this.gl.vertexAttribPointer(set.attribute, set.size, this.gl.FLOAT, this.gl.FALSE, set.stride, set.offset);
        if ('divisor' in set){
            this.gl.vertexAttribDivisor(set.attribute, set.divisor);
        }
    }


    bindUniforms(options) {
        for(let key in this.uniforms){
            if (this.uniforms[key].assignFunction == this.GLType.mat4){
                this.uniforms[key].assignFunction(this.uniforms[key].location, this.gl.FALSE, options[key]);
            } else {
                this.uniforms[key].assignFunction(this.uniforms[key].location, options[key]);
            }
        }
    }

    commonUniforms() {
        this.setupUniforms({
            model: {
                name: 'mWorld',
                type: this.GLType.mat4,
            },
			view: {
                name: 'mView',
                type: this.GLType.mat4,   
            },
            proj: {
                name: 'mProj',
                type: this.GLType.mat4,
            },
        });
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
}