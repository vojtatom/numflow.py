'use strict';

class Graphics {
    constructor(canvas) {
		this.canvas = canvas;
		this.scenes = [];

		//active scene
		this.scene = null;
    }

    init() {
		console.log('Getting webgl 2 context');
		this.gl = this.canvas.getContext('webgl2');

		if (!this.gl) {
			console.error('WebGL 2 not supported');
			throw 'WebGL 2 not supported';
		}

		//this.gl.enable(this.gl.DEPTH_TEST);
		//this.gl.disable(this.gl.BLEND);
		this.gl.disable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
		//this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
		
		//this.scene = new Scene(this.gl);
		//this.scene.init();
	}

	resize(x, y) {
		this.canvas.width = x;
		this.canvas.height = y;

		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
		//setup for each of existing scenes
		for (let scene of this.scenes){
			scene.aspect = this.canvas.width / this.canvas.height;
		}
	}

	render(){
		if (this.scene !== null){
			this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
			this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
			this.scene.render();
		}
	}

	addScene(scene_contents){
		let scene = new Scene(this.gl);
		scene.init(scene_contents);
		this.scenes.push(scene);

		if (this.scene === null){
			this.scene = scene;
			scene.aspect = this.canvas.width / this.canvas.height;
		}
	}

	delete(){
		//Delete all of the scenes...
		for (let scene of this.scenes){
			scene.detele();
		}
		
		this.scene = null
		this.scenes = [];
	}
}