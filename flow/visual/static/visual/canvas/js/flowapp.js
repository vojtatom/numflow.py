'use strict';

class FlowApp {
    constructor(canvas) {
        this.canvas = canvas;
        this.interface = new Interface(this);
        this.graphics = new Graphics(canvas);
    }

    init(key) {
        this.key = key;
        this.graphics.init();
    }

    load(contents){
        //delete all previously allocated buffers and data etc.
        this.graphics.delete();
        //allocate new scenes
        for (let scene_id in contents) {
            console.log('loading scene', scene_id);
            this.graphics.addScene(contents[scene_id]);
        }
    }

    render() {
        this.graphics.render();

        if (this.interface.keys[84]){
            this.graphics.scene.camera.setPosition(CameraPosition.top);
        }
        if (this.interface.keys[70]){
            this.graphics.scene.camera.setPosition(CameraPosition.front);
        }
        if (this.interface.keys[82]){
            this.graphics.scene.camera.setPosition(CameraPosition.side);
        }

        if (this.interface.keys[87]){
            this.graphics.scene.camera.setPosition(CameraPosition.rotateUp);
        }
        if (this.interface.keys[83]){
            this.graphics.scene.camera.setPosition(CameraPosition.rotateDown);
        }

        if (this.interface.keys[68]){
            this.graphics.scene.camera.setPosition(CameraPosition.rotateRight);
        }
        if (this.interface.keys[65]){
            this.graphics.scene.camera.setPosition(CameraPosition.rotateLeft);
        }

        if (this.interface.keys[81]){
            this.graphics.scene.camera.setPosition(CameraPosition.moveUp);
        }
        if (this.interface.keys[69]){
            this.graphics.scene.camera.setPosition(CameraPosition.moveDown);
        }

        if (this.interface.keys[72]){
            this.graphics.scene.camera.setPosition(CameraPosition.origin);
        }
    }

    
}