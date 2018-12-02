'use strict';

const MOVE_STEP = 0.5;
const ZOOM_STEP = 0.1;
const ROT_STEP = 0.5;
const SCALE_STEP = 1;
const PROJECT = true;

class Camera {

    constructor(aspect) {
        this.position = vec3.fromValues(0, 0, -100);
        this.center = vec3.fromValues(0, 0, 0);
        this.targetCenter = null;
        this.up = vec3.fromValues(0, 1, 0);
        this.aspect = aspect;
        this.velocity = vec3.fromValues(0, 0, 0);
    }

    getFront() {
        let front = vec3.sub(vec3.create(), this.center, this.position);
        return vec3.normalize(vec3.create(), front);
    }

    moveFront(scale = 1) {
        let mov = vec3.scale(vec3.create(), this.getFront(), ZOOM_STEP * scale);
        this.position = vec3.add(vec3.create(), this.position, mov);
    }

    moveBack(scale = 1) {
        let mov = vec3.scale(vec3.create(), this.getFront(), -ZOOM_STEP * scale);
        this.position = vec3.add(vec3.create(), this.position, mov);
    }

    setCenter(center) {
        if (this.targetCenter == null){
            this.center = center;
        }
        this.targetCenter = center;
    }

    resize(aspect) {
        this.aspect = aspect;
    }

    frame(){
        if(this.targetCenter === null) return;

        if (!vec3.equals(this.center, this.targetCenter)){
            let accel = vec3.sub(vec3.create(), this.targetCenter, this.center)
            accel = vec3.scale(vec3.create(), accel, 0.25);
            this.velocity = vec3.add(vec3.create(), this.velocity, accel);
            this.velocity = vec3.scale(vec3.create(), this.velocity, 0.25);
            this.center = vec3.add(vec3.create(), this.center, this.velocity);
        }
    }

    getView() {
        return mat4.lookAt(new Float32Array(16), this.position, this.center, this.up);
    }

    getProjection() {
        return mat4.perspective(new Float32Array(16), glMatrix.toRadian(45), this.aspect, 0.1, 2000.0);
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