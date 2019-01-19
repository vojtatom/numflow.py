'use strict';

class Canvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.interface = new Interface(this);
        this.graphics = new Graphics(canvas);
    }

    init(key) {
        this.key = key;
        this.graphics.init();
    }

    render() {
        this.graphics.render();
    }

    
}