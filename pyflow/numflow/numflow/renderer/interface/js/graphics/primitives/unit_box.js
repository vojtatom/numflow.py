'use strict';

class UnitBox extends Primitive {
    constructor(gl, programs) {
        super(gl);
        this.program = programs.box;
        this.loaded = false;
    }

    init() {
        var boxVert = [
            1, 1, 1,
            1, 1, 0,
            0, 1, 0,
            0, 1, 1,
            1, 0, 1,
            1, 0, 0,
            0, 0, 0,
            0, 0, 1
        ];

        var boxInd = [
            0, 1,
            0, 3,
            2, 1,
            2, 3,
            4, 5,
            4, 7,
            6, 7,
            5, 6,
            0, 4,
            1, 5,
            3, 7,
            2, 6,
        ];

        /*var fullBoxInd = [
            6, 5, 4,
            6, 4, 7,
            5, 1, 0,
            5, 0, 4,
            1, 2, 3,
            1, 3, 0,
            2, 6, 7,
            2, 7, 3,
            7, 4, 0,
            7, 0, 3,
            2, 1, 5,
            2, 5, 6,
        ];*/

        // init VBO
        let vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(boxVert), this.gl.STATIC_DRAW);
        this.addBufferVBO(vbo);

        // init EBO
        let ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxInd), this.gl.STATIC_DRAW);
        this.addBufferEBO(ebo);

        //init VAO
        let vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);
        this.addBufferVAO(vao);
        this.program.bindAttrPosition();
        this.gl.bindVertexArray(null);
            
        this.sizes.instanceSize = boxInd.length;
    }

    render(camera, light) {
        //this.program.bind();
        this.bindBuffersAndTextures();

        let uniforms = this.uniformDict(camera, light);
        this.program.bindUniforms(uniforms);

        this.gl.drawElements(this.gl.LINES, this.sizes.instanceSize, this.gl.UNSIGNED_SHORT, 0);
        //console.log(this.gl.getError());

        this.gl.bindVertexArray(null);
        //this.program.unbind();
    }
}