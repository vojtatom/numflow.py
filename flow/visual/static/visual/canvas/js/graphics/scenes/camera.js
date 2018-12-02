'use strict';

const MOVE_STEP = 0.5;
const ZOOM_STEP = 0.1;
const ROT_STEP = 0.5;
const SCALE_STEP = 1;

class Camera {
    constructor() {
        this.position = vec3.fromValues(0, 0, -10);
        this.center = vec3.fromValues(0, 0, 0);
        this.up = vec3.fromValues(0, 1, 0);
        this.aspect = 1;
    }

    get view() {
        return mat4.lookAt(new Float32Array(16), this.position, this.center, this.up);
    }

    get projection() {
        return mat4.perspective(new Float32Array(16), glMatrix.toRadian(45), this.aspect, 0.1, 2000.0);
    }

    get front() {
        let front = vec3.sub(vec3.create(), this.center, this.position);
        return vec3.normalize(vec3.create(), front);
    }

    moveFront(scale = 1) {
        let mov = vec3.scale(vec3.create(), this.front, ZOOM_STEP * scale);
        this.position = vec3.add(vec3.create(), this.position, mov);
    }

    moveBack(scale = 1) {
        let mov = vec3.scale(vec3.create(), this.front, -ZOOM_STEP * scale);
        this.position = vec3.add(vec3.create(), this.position, mov);
    }

    rotate(x, y) {
        let a_x = glMatrix.toRadian(-x) * ROT_STEP;
        let a_y = glMatrix.toRadian(y) * ROT_STEP;
        let front = vec3.sub(vec3.create(), this.center, this.position);

        let axes_x = vec3.cross(vec3.create(), this.up, front);
        let axes_y = this.up;

        let yaw = mat4.rotate(mat4.create(), mat4.create(), a_x, axes_y);
        let com = mat4.rotate(mat4.create(), yaw, a_y, axes_x);
        front = vec3.transformMat4(vec3.create(), front, com);
        this.position = vec3.add(vec3.create(), this.center, vec3.negate(vec3.create(), front))
        this.up = vec3.transformMat4(vec3.create(), this.up, com);
    }
}