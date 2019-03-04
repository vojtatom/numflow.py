'use strict';

class DType {
	static get int(){
		return 0;
	}

	static get float(){
		return 1;
	}
}

class Primitive {
    constructor(gl) {
		this.gl = gl;
		this.lateLoaded = false;
		this._data = null;
		
		//store buffers for auto delete and auto binding
		this.buffers = {
			vao : undefined,
			ebo : undefined,
			vbo: [],
		};

		//store textures for auto delete and autobinding
		this.textures = [];

		//draw sizes...
		this.sizes = {
			instances: 1,
			instanceSize: 1,
		};
	}

    get transparent() {
		if (!('meta' in this))
			return false;
        return this.meta.appearance === Appearance.transparent;
    }

    static base64totype(data, mode=DType.float) {
		let blob = window.atob(data);
		let array;

		if (mode === DType.float){
			let len = blob.length / Float32Array.BYTES_PER_ELEMENT;
			let view = new DataView(new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT));
			array = new Float32Array(len);
	
			for (let p = 0; p < len * 4; p = p + 4) {
				view.setUint8(0, blob.charCodeAt(p));
				view.setUint8(1, blob.charCodeAt(p + 1));
				view.setUint8(2, blob.charCodeAt(p + 2));
				view.setUint8(3, blob.charCodeAt(p + 3));
				array[p / 4] = view.getFloat32(0, true);
			}
			view = null;

		} else if (mode === DType.int) {
			let len = blob.length / Int32Array.BYTES_PER_ELEMENT;
			let view = new DataView(new ArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
			array = new Int32Array(len);
	
			for (let p = 0; p < len * 4; p = p + 4) {
				view.setUint8(0, blob.charCodeAt(p));
				view.setUint8(1, blob.charCodeAt(p + 1));
				view.setUint8(2, blob.charCodeAt(p + 2));
				view.setUint8(3, blob.charCodeAt(p + 3));
				array[p / 4] = view.getInt32(0, true);
			}
			view = null;
		}

		blob = null;
		return array;
	}

	//INIT MANAGEMENT
	get isRenderReady(){
		if (!this.loaded){
			this.init();
		}
		
		return this.loaded;
	}

	isInitReady(data){
		if (!this.program.loaded && data !== null){
			this._data = data;
			this.lateLoaded = true;
            return false;
        }

        if (this.program.loaded && (this._data !== null || data !== null)){
			return true;
		}
		
		return false;
	}

	lateLoadData(data){
		if (data === null && this.lateLoaded){
			data = this._data;
			this._data = null;
			return data;
		} else if (data !== null){
			return data;
		}
	}

	//BUFFERS MANAGEMENT
	addBufferVAO(buffer){
		this.buffers.vao = buffer;
	}

	addBufferVBO(buffer){
		this.buffers.vbo.push(buffer);
	}

	addBufferEBO(buffer){
		this.buffers.ebo = buffer;
	}

	addTexture(texture) {
		this.textures.push(texture);
	}

	bindBuffersAndTextures(){
		this.gl.bindVertexArray(this.buffers.vao);

		for (let buffer of this.buffers.vbo){
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		}
		
		if (this.buffers.ebo !== undefined) {
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.ebo);
		}

		for (let texture of this.textures){
			this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		}
	}

	//META INFO MANAGEMENT
	metaFromData(meta, stats){
		this.meta = {};
	}

	appendMeta(options){
		this.meta = Object.assign({}, this.meta, options);
	}

	uniformDict(camera, light){
		return Object.assign({}, this.meta, {
			model: this.model,
			view: camera.view,
			proj: camera.projection,
			light: light.pos,
			farplane: camera.farplane,
		});
	}

	//RESOURCES DELETE
    delete(){
		for (let texture of this.textures){
			this.gl.deleteTexture(this.gl.TEXTURE_2D, texture);
		}

		for (let buffer of this.buffers.vbo){
			this.gl.deleteBuffer(buffer);
		}
		
		if (this.buffers.ebo !== undefined) {
			this.gl.deleteBuffer(this.buffers.ebo);
		}

        this.gl.deleteVertexArray(this.buffers.vao);
    }
}