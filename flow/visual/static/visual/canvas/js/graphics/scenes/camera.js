'use strict';

const MOVE_STEP = 0.5;
const ZOOM_STEP = 0.1;
const ROT_STEP = 0.5;
const SCALE_STEP = 1;

class CameraPosition {
    static get top() {
        return 1;
    }

    static get front() {
        return 2;
    }

    static get side() {
        return 3;
    }

    static get moveUp() {
        return 4;
    }

    static get moveDown() {
        return 5;
    }

    static get rotateUp() {
        return 6;
    }

    static get rotateDown() {
        return 7;
    }

    static get rotateRight() {
        return 8;
    }

    static get rotateLeft() {
        return 9;
    }

    static get origin() {
        return 10;
    }
}

class Camera {
    constructor() {
        this.position = vec3.fromValues(0, -20, 0);
        this.up = vec3.fromValues(0, 0, 1);
        this.center = vec3.fromValues(0, 0, 0);

        this.viewMatrix = new Float32Array(16);
        this.projectionMatrix = new Float32Array(16);
        this.rotateMatrix = new Float32Array(16);
        this.frontVector = new Float32Array(3);
        this.tmp = new Float32Array(3);

        //constatnts
        this.globalSide = vec3.fromValues(50, 0, 0);
        this.globalFront = vec3.fromValues(0, -50, 0);
        this.globalUp = vec3.fromValues(0, 0, 50);
        this.aspect = 1;
        this.screenX = 1;
        this.screenY = 1;
        this.speed = 0.05;

        //state
        this.actualPosition = vec3.fromValues(0, -20, 0);
        this.actualUp = vec3.fromValues(0, 0, 1);
        this.actualCenter = vec3.fromValues(0, 0, 0);
        
        this.positionMomentum = 0;
        this.centerMomentum = 0;
        this.rotMomentum = 0;
    }

    get view() {
        return mat4.lookAt(this.viewMatrix, this.actualPosition, this.actualCenter, this.actualUp);
    }

    get projection() {
        return mat4.perspective(this.projectionMatrix, glMatrix.toRadian(45), this.aspect, 0.1, 2000.0);
    }

    get front() {
        vec3.sub(this.frontVector, this.center, this.position);
        return vec3.normalize(this.frontVector, this.frontVector,);
    }

    get screenDim() {
        return vec2.fromValues(this.screenX, this.screenY);
    }

    screen(x, y){
        this.screenX = x;
        this.screenY = y;
        this.aspect = x / y;
    }


    setPosition(position){
        if (position === CameraPosition.top){
            vec3.add(this.position, this.center, this.globalUp);
            this.up = vec3.fromValues(0, 1, 0);
        } else if (position === CameraPosition.front){
            vec3.add(this.position, this.center, this.globalFront);
            this.up = vec3.fromValues(0, 0, 1);
        } else if (position === CameraPosition.side){
            vec3.add(this.position, this.center, this.globalSide);
            this.up = vec3.fromValues(0, 0, 1);
        } else if (position === CameraPosition.rotateUp || position === CameraPosition.rotateDown) {
            let angle = (position === CameraPosition.rotateUp) ? glMatrix.toRadian(1) : glMatrix.toRadian(-1);
            let front = vec3.sub(vec3.create(), this.center, this.position);
            let axes_x = vec3.cross(this.tmp, this.up, this.front);
            mat4.rotate(this.rotateMatrix, mat4.create(), angle, axes_x);
            vec3.transformMat4(front, front, this.rotateMatrix);
            vec3.add(this.position, this.center, vec3.negate(front, front))
            vec3.transformMat4(this.up, this.up, this.rotateMatrix);
        } else if (position === CameraPosition.rotateRight || position === CameraPosition.rotateLeft) {
            let angle = position === CameraPosition.rotateRight ? glMatrix.toRadian(1) : glMatrix.toRadian(-1);
            let front = vec3.sub(vec3.create(), this.center, this.position);
            let axes_y = this.globalUp;
            mat4.rotate(this.rotateMatrix, mat4.create(), angle, axes_y);
            vec3.transformMat4(front, front, this.rotateMatrix);
            vec3.add(this.position, this.center, vec3.negate(front, front))
            vec3.transformMat4(this.up, this.up, this.rotateMatrix);
        } else if (position === CameraPosition.moveUp){
            vec3.add(this.position, this.position, this.up);
            vec3.add(this.center, this.center, this.up);
        } else if (position === CameraPosition.moveDown){
            vec3.add(this.position, this.position, vec3.negate(this.tmp, this.up));
            vec3.add(this.center, this.center, vec3.negate(this.tmp, this.up));
        } else if (position === CameraPosition.origin){
            this.position = vec3.fromValues(0, -20, 0);
            this.up = vec3.fromValues(0, 0, 1);
            this.center = vec3.fromValues(0, 0, 0);
        }
    }

    moveFront(scale = 1) {
        vec3.scaleAndAdd(this.position, this.position, this.front, ZOOM_STEP * scale)
    }

    moveBack(scale = 1) {
        vec3.scaleAndAdd(this.position, this.position, this.front, - ZOOM_STEP * scale)
    }

    rotate(x, y) {
        let a_x = glMatrix.toRadian(-x) * ROT_STEP;
        let a_y = glMatrix.toRadian(y) * ROT_STEP;
        let front = vec3.sub(vec3.create(), this.center, this.position);

        let axes_x = vec3.cross(this.tmp, this.up, this.front);
        let axes_y = this.up;

        mat4.fromRotation(this.rotateMatrix, a_x, axes_y);
        mat4.rotate(this.rotateMatrix, this.rotateMatrix, a_y, axes_x);
        vec3.transformMat4(front, front, this.rotateMatrix);
        
        vec3.add(this.position, this.center, vec3.negate(front, front))
        vec3.transformMat4(this.up, this.up, this.rotateMatrix);
    }

    frame(){
        vec3.sub(this.tmp, this.position, this.actualPosition);
        this.positionMomentum = Math.min(vec3.length(this.tmp), this.speed * 2.0);
        if (this.positionMomentum > 0.02){
            vec3.scaleAndAdd(this.actualPosition, this.actualPosition, this.tmp, this.positionMomentum);
        } else {
            vec3.copy(this.actualPosition, this.position);
            this.positionMomentum = 0;
        }
        
        this.rotMomentum = Math.min(vec3.angle(this.actualUp, this.up), this.speed * 3.14);
        if (this.rotMomentum > 0.02) {
            let axis = vec3.cross(this.tmp, this.actualUp, this.up);
            mat4.fromRotation(this.rotateMatrix, this.rotMomentum, axis);
            vec3.transformMat4(this.actualUp, this.actualUp, this.rotateMatrix);   
        } else {
            vec3.copy(this.actualUp, this.up);
            this.rotMomentum = 0;
        }

        vec3.sub(this.tmp, this.center, this.actualCenter);
        this.centerMomentum = Math.min(vec3.length(this.tmp), this.speed * 2.0);
        if (this.centerMomentum > 0.02){
            vec3.scaleAndAdd(this.actualCenter, this.actualCenter, this.tmp, this.centerMomentum);
        } else {
            vec3.copy(this.actualCenter, this.center);
            this.centerMomentum = 0;
        }
    }

    get isMoving(){
        if (this.centerMomentum || this.rotMomentum || this.positionMomentum){
            //console.log(this.centerMomentum, this.rotMomentum, this.positionMomentum);
            return true;
        }
        return false;
    }
}