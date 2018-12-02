'use strict';

class Box extends Primitive {
    constructor(gl) {
        super();
        this.gl = gl;
        this.program = new BoxProgram(gl);
    }

    
}