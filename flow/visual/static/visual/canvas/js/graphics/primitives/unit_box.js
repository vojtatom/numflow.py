'use strict';

class UnitBox extends Primitive {
    constructor(gl) {
        if(!UnitBox.instance){
            super(gl);
            this.program = new BoxProgram(gl);
            UnitBox.instance = this;
            this.loaded = false;
        }

        return UnitBox.instance
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

        // init VBO
        let vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(boxVert), this.gl.STATIC_DRAW);

        // init EBO
        let ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxInd), this.gl.STATIC_DRAW);

        //init VAO
        let vao = this.gl.createVertexArray();
        
        this.gl.bindVertexArray(vao);
        this.program.setAttrs();
        this.gl.bindVertexArray(null);
        
        this.buffers = {
            vbo: vbo,
            ebo: ebo,
            vao: vao,
            size: boxInd.length,
        };

        this.loaded = true;
    }

    render(uniforms) {
        if (!this.program.loaded)
            return;

        if (!this.loaded)
            this.init();

        this.program.bind();

        this.gl.bindVertexArray(this.buffers.vao);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.vbo);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.ebo);

        this.program.setUnifs(uniforms)

        this.gl.drawElements(this.gl.LINES, this.buffers.size, this.gl.UNSIGNED_SHORT, 0);
        //console.log(this.gl.getError());

        this.gl.bindVertexArray(null);
        this.program.unbind();
    }
}