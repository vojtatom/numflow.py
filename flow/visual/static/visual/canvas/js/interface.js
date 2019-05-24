'use strict';

/**
 * User interface handeling the user inputs.
 */
class Interface {
    /**
     * Create an instance of the user interface.   
     * @param {FlowApp} app applicaiton instance
     */
    constructor(app) {
        this.app = app;
        this.keys = {};
        this.mouse = {
            x: null,
            y: null,
            down: false,
        };
    }

    /**
     * Callback for the key press.
     * @param {string} key key code
     */
    onKeyDown(key) {
        this.keys[key] = true;
        this.app.pressed(key);
        console.log(key);
    }

    /**
     * Callback for the key release.
     * @param {string} key key code
     */
    onKeyUp(key){
        this.keys[key] = false;
    }

    /**
     * Callback for the mouse press.
     * @param {int} x x coordinate of the mouse position
     * @param {int} y y coordinate of the mouse position
     */
    onMouseDown(x, y) {
        this.mouse.down = true;
        this.mouse.x = x;
        this.mouse.y = y;
    };

    /**
     * Callback for the mouse release.
     * @param {int} x x coordinate of the mouse position
     * @param {int} y y coordinate of the mouse position
     */
    onMouseUp(x, y) {
        this.mouse.down = false;
    };

    /**
     * Callback for the mouse movement.
     * @param {int} x x coordinate of the mouse position
     * @param {int} y y coordinate of the mouse position
     */
    onMouseMove(x, y) {
        if (!this.mouse.down) {
            return;
        }

        let delta_x = x - this.mouse.x;
        let delta_y = y - this.mouse.y;

        this.mouse.x = x
        this.mouse.y = y;

        this.app.graphics.rotate(delta_x, delta_y);
    };

    /**
     * Callback for the mouse wheel movement.
     * @param {int} delta mouse wheel delta
     */
    wheel(delta){
        if (delta > 0)
            this.app.graphics.moveFront(delta);
		else
            this.app.graphics.moveBack(-delta);
    }
}