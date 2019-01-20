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
    }

    
}