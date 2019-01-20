'use strict';

class Primitive {
    constructor(gl) {
        this.gl = gl;
    }

    static base64tofloat32(data) {
		let blob = window.atob(data);
		let len = blob.length / Float32Array.BYTES_PER_ELEMENT;
		let view = new DataView(new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT));
		let floats = new Float32Array(len);

		for (let p = 0; p < len * 4; p = p + 4) {
			view.setUint8(0, blob.charCodeAt(p));
			view.setUint8(1, blob.charCodeAt(p + 1));
			view.setUint8(2, blob.charCodeAt(p + 2));
			view.setUint8(3, blob.charCodeAt(p + 3));
			floats[p / 4] = view.getFloat32(0, true);
		}

		blob = null;
		view = null;
		return floats;
	}

    delete(){
        
    }
}