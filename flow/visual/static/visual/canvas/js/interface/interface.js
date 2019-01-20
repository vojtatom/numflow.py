'use strict';

class Interface {
    constructor(app) {
        this.app = app;
        this.keys = {};
        this.mouse = {
            x: null,
            y: null,
            down: false,
        };
    }

    onKeyDown(key) {
        this.keys[key] = true;
        //this.app.pressed(key);
        console.log(key);
    }

    onKeyUp(key){
        this.keys[key] = false;
    }

    onMouseDown(x, y) {
        this.mouse.down = true;
        this.mouse.x = x;
        this.mouse.y = y;
    };

    onMouseUp(x, y) {
        this.mouse.down = false;
    };

    onMouseMove(x, y) {
        if (!this.mouse.down) {
            return;
        }

        let delta_x = x - this.mouse.x;
        let delta_y = y - this.mouse.y;

        this.mouse.x = x
        this.mouse.y = y;

        this.app.graphics.scene.camera.rotate(delta_x, delta_y);
    };

    wheel(delta){
        if (delta > 0)
            this.app.graphics.scene.camera.moveFront(delta);
		else
            this.app.graphics.scene.camera.moveBack(-delta);
    }
}