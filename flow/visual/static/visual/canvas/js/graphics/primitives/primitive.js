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
		this.transparent = false; 
		this._data = null;
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

	initBoundingBox(data){
		this.box.init(data);
	}

    delete(){
        
    }
}