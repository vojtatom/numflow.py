'use strict';

class FlowApp {
    constructor(canvas) {
        this.canvas = canvas;
        this.interface = new Interface(this);
        this.graphics = new Graphics(canvas);
        this.ui = new FlowAppUI(canvas);
    }

    init(key) {
        this.key = key;
        this.graphics.init();
    }

    load(contents){
        //delete all previously allocated buffers and data etc.
        this.graphics.delete();
        this.ui.delete();

        //allocate new scenes
        for (let scene_id in contents) {
            console.log('loading scene', scene_id);
            this.graphics.addScene(contents[scene_id]);
        }

        //none was allocated so has to be first scene
		this.ui.displayScene(0); //zero as first scene
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
            if (this.interface.keys[16]){
                this.graphics.scene.camera.setPosition(CameraPosition.moveUp);
            } else {
                this.graphics.scene.camera.setPosition(CameraPosition.rotateUp);
            }
        }
        if (this.interface.keys[83]){
            if (this.interface.keys[16]){
                this.graphics.scene.camera.setPosition(CameraPosition.moveDown);
            } else {
                this.graphics.scene.camera.setPosition(CameraPosition.rotateDown);
            }
        }

        if (this.interface.keys[68]){
            if (this.interface.keys[16]){
                this.graphics.scene.camera.moveRight();
            } else {
                this.graphics.scene.camera.setPosition(CameraPosition.rotateRight);
            }
        }
        if (this.interface.keys[65]){
            if (this.interface.keys[16]){
                this.graphics.scene.camera.moveLeft();
            } else {
                this.graphics.scene.camera.setPosition(CameraPosition.rotateLeft);
            }
        }

        if (this.interface.keys[72]){
            this.graphics.scene.camera.setPosition(CameraPosition.origin);
        }
    }

    pressed(key){
        if (key === 40){
            //16 = shift 
            if (this.interface.keys[16]){
                this.ui.nextWidget();
            } else {
                this.ui.nextField();
            }
        }

        if (key === 38){
            //16 = shift 
            if (this.interface.keys[16]){
                this.ui.previousWidget();
            } else {
                this.ui.previousField();
            }
        }

        if (key === 39){
            //16 = shift 
            if (this.interface.keys[16]){
                this.ui.nextScene();
            } else {
                this.ui.nextValue();
            }
        }

        if (key === 37){
            //16 = shift 
            if (this.interface.keys[16]){
                this.ui.previousScene();
            } else {
                this.ui.previousValue();
            }
        }

        if (key === 13){
            let sceneId = this.ui.selectedScene;
            this.graphics.displayScene(sceneId);
            this.ui.displayScene(sceneId);
        }

        if (key === 77){
            this.ui.toggleMenu();
        }

        if (key === 80){
            this.graphics.scene.camera.toggleMode();
        }
    }

    
}