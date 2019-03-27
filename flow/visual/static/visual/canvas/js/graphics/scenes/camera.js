'use strict';

const MOVE_STEP = 0.5;
const ROT_STEP = 0.5;

const ZOOM_STEP = 0.001;

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


class CameraState {
    static get perspective() {
        return 0;
    }

    static get ortho() {
        return 1;
    }
}


class Camera {
    constructor() {
        this.position = vec3.fromValues(0, -200, 0);
        this.up = vec3.fromValues(0, 0, 1);
        this.center = vec3.fromValues(0, 0, 0);
        this.normal = vec3.create();
        this.scale = 100;

        this.viewMatrix = new Float32Array(16);
        this.projectionMatrix = new Float32Array(16);
        this.rotateMatrix = new Float32Array(16);
        this.frontVector = new Float32Array(3);
        this.tmp = new Float32Array(3);
        this.tmp2 = new Float32Array(3);

        //constatnts
        this.aspect = 1;
        this.screenX = 1;
        this.screenY = 1;
        this.speed = 0.05;

        //state
        this.actualPosition = vec3.fromValues(0, -200, 0);
        this.actualUp = vec3.fromValues(0, 0, 1);
        this.actualCenter = vec3.fromValues(0, 0, 0);
        this.actualScale = 100;
        
        this.positionMomentum = 0;
        this.centerMomentum = 0;
        this.rotMomentum = 0;
        this.scaleMomentum = 0;

        this.mode = CameraState.perspective;

        this.sceneChanged = true;
        this.farplane = 200.0;
    }

    get view() {
        if (this.mode === CameraState.perspective){
            return mat4.lookAt(this.viewMatrix, this.actualPosition, this.actualCenter, this.actualUp);
        } else {
            vec3.sub(this.tmp, this.actualPosition, this.actualCenter);
            vec3.normalize(this.tmp, this.tmp);
            vec3.scale(this.tmp, this.tmp, 1000);
            vec3.add(this.tmp, this.actualCenter, this.tmp);
            return mat4.lookAt(this.viewMatrix, this.tmp, this.actualCenter, this.actualUp);
        }
    }

    get projection() {
        if (this.mode === CameraState.perspective){
            return mat4.perspective(this.projectionMatrix, glMatrix.toRadian(45), this.aspect, 0.1, this.farplane);
        } else {
            return mat4.ortho(this.projectionMatrix, -this.actualScale, this.actualScale, -this.actualScale / this.aspect, this.actualScale / this.aspect, 0.1, 10 * this.farplane);
        }

    }

    get front() {
        vec3.sub(this.frontVector, this.center, this.position);
        return vec3.normalize(this.frontVector, this.frontVector);
    }

    get screenDim() {
        return vec2.fromValues(this.screenX, this.screenY);
    }

    get pos() {
        return this.actualPosition; 
    }

    sceneSetup(stats){
        let min = vec3.len(vec3.sub(vec3.create(), stats.center, stats.min)) * stats.scale_factor;
        let max = vec3.len(vec3.sub(vec3.create(), stats.center, stats.max)) * stats.scale_factor;

        this.geometryCenter = vec3.fromValues(0, 0, 0);
        this.geometryRadius = Math.max(min, max);
    }

    screen(x, y){
        this.screenX = x;
        this.screenY = y;
        this.aspect = x / y;
        this.sceneChanged = true;
    }


    setPosition(position){
        if (position === CameraPosition.top){
            
            let length = vec3.dist(this.position, this.center);
            vec3.copy(this.position, this.center);
            this.position[2] += Math.max(1.0, length);
            this.up = vec3.fromValues(0, 1, 0);

        } else if (position === CameraPosition.front){

            let length = vec3.dist(this.position, this.center);
            vec3.copy(this.position, this.center);
            this.position[1] += Math.min(-1.0, -length);
            this.up = vec3.fromValues(0, 0, 1);

        } else if (position === CameraPosition.side){
            
            let length = vec3.dist(this.position, this.center);
            vec3.copy(this.position, this.center);
            this.position[0] += Math.max(1.0, length);
            this.up = vec3.fromValues(0, 0, 1);

        } else if (position === CameraPosition.rotateUp || position === CameraPosition.rotateDown) {
            
            let angle = (position === CameraPosition.rotateUp) ? glMatrix.toRadian(1) : glMatrix.toRadian(-1);
            
            vec3.sub(this.tmp2, this.center, this.position);
            let axes_x = vec3.cross(this.tmp, this.up, this.front);
            
            mat4.fromRotation(this.rotateMatrix, angle, axes_x);
            vec3.transformMat4(this.tmp2, this.tmp2, this.rotateMatrix);
            vec3.add(this.position, this.center, vec3.negate(this.tmp2, this.tmp2))
            vec3.transformMat4(this.up, this.up, this.rotateMatrix);
        
        } else if (position === CameraPosition.rotateRight || position === CameraPosition.rotateLeft) {
            let angle = position === CameraPosition.rotateRight ? glMatrix.toRadian(1) : glMatrix.toRadian(-1);
            
            vec3.sub(this.tmp2, this.center, this.position);
            let axes_y = this.up;
            
            mat4.fromRotation(this.rotateMatrix, angle, axes_y);
            vec3.transformMat4(this.tmp2, this.tmp2, this.rotateMatrix);
            vec3.add(this.position, this.center, vec3.negate(this.tmp2, this.tmp2))
            vec3.transformMat4(this.up, this.up, this.rotateMatrix);
        
        } else if (position === CameraPosition.moveUp){

            vec3.add(this.position, this.position, this.up);
            vec3.add(this.center, this.center, this.up);

        } else if (position === CameraPosition.moveDown){

            vec3.add(this.position, this.position, vec3.negate(this.tmp, this.up));
            vec3.add(this.center, this.center, vec3.negate(this.tmp, this.up));

        } else if (position === CameraPosition.origin){

            this.position = vec3.fromValues(0, -200, 0);
            this.up = vec3.fromValues(0, 0, 1);
            this.center = vec3.fromValues(0, 0, 0);

        }
    }


    moveFront(scale = 1) {
        if (this.mode === CameraState.perspective){
            vec3.sub(this.tmp, this.position, this.center);
            vec3.scale(this.tmp, this.tmp, 1 - (ZOOM_STEP * scale));
            vec3.add(this.tmp, this.center, this.tmp);
            vec3.copy(this.position, this.tmp);
        } else {
            this.scale = this.scale * (1 - (ZOOM_STEP * 0.5 * scale));
        }

    }


    moveBack(scale = 1) {
        if (this.mode === CameraState.perspective){
            vec3.sub(this.tmp, this.position, this.center);
            vec3.scale(this.tmp, this.tmp, 1 + (ZOOM_STEP * scale));
            vec3.add(this.tmp, this.center, this.tmp);
            vec3.copy(this.position, this.tmp);
        } else {
            this.scale = this.scale * (1 + (ZOOM_STEP * 0.5 * scale));
        }

    }


    moveLeft(scale = 1) {
        vec3.sub(this.tmp, this.center, this.position);
        vec3.cross(this.normal, this.up, this.tmp);
        vec3.normalize(this.normal, this.normal);

        vec3.scaleAndAdd(this.position, this.position, this.normal, MOVE_STEP * scale);
        vec3.scaleAndAdd(this.center, this.center, this.normal, MOVE_STEP * scale);
    }

    moveRight(scale = 1) {
        vec3.sub(this.tmp, this.center, this.position);
        vec3.cross(this.normal, this.up, this.tmp);
        vec3.normalize(this.normal, this.normal);
        vec3.negate(this.normal, this.normal);

        vec3.scaleAndAdd(this.position, this.position, this.normal, MOVE_STEP * scale);
        vec3.scaleAndAdd(this.center, this.center, this.normal, MOVE_STEP * scale);
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

        this.scaleMomentum = Math.abs(this.scale - this.actualScale) * this.speed;
        if (this.scaleMomentum > 0.02){
            this.actualScale = this.actualScale + (this.scale - this.actualScale) * this.scaleMomentum;
        } else {
            this.actualScale = this.scale;
            this.scaleMomentum = 0;
        }

        //tmp is now direction of view
        vec3.sub(this.tmp, this.geometryCenter, this.actualPosition); 
        //adding dist from position to geometry center and radius of geomtry from the geom center
        this.farplane = vec3.len(this.tmp) + this.geometryRadius;
    }

    get isMoving(){

        if (this.centerMomentum || this.rotMomentum || this.positionMomentum || this.scaleMomentum){
            //console.log(this.centerMomentum, this.rotMomentum, this.positionMomentum);
            return true;
        }
        return false;
    }

    get needsRender(){
        if (this.sceneChanged){
            this.sceneChanged = false;
            return true;
        }

        return this.isMoving
    }


    toggleMode(){
        if (this.mode === CameraState.perspective){
            this.mode = CameraState.ortho;
        } else {
            this.mode = CameraState.perspective;
        }
    }

    getState(){
        return {
            position: this.position,
            up: this.up,
            center: this.center,
            normal: this.normal,
            scale: this.scale,
        };
    }

    setState(state){
        vec3.copy(this.position, state.position);
        vec3.copy(this.up, state.up);
        vec3.copy(this.center, state.center);
        vec3.copy(this.normal, state.normal);
        this.scale = state.scale;

        this.sceneChanged = true;
    }
}