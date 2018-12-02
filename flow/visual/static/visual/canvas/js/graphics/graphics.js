'use strict';

class Graphics {
    constructor(canvas) {
		this.canvas = canvas;
    }

    init() {
		console.log('Getting webgl 2 context');
		this.gl = this.canvas.getContext('webgl2');

		if (!this.gl) {
			console.error('WebGL 2 not supported');
			throw 'WebGL 2 not supported';
		}

		this.gl.disable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
		//this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
		
	}

	resize(x, y) {
		this.canvas.width = x;
		this.canvas.height = y;
		let aspect = this.canvas.width / this.canvas.height;
		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
		this.camera.resize(aspect);
	}

	render(){
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
	}

    
}