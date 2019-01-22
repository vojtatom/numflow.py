'use strict';

class Light{
    constructor(){
        this.pos = vec3.fromValues(-20, -20, -20);
    }

    get position(){
        return this.pos;
    }
}