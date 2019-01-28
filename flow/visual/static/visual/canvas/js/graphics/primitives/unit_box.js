'use strict';

class BoxMode{
    static get wireframe() {
        return 0;
    }

    static get filled() {
        return 1;
    }
}

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

        var fullBoxInd = [
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
        ];

        // init VBO
        let vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(boxVert), this.gl.STATIC_DRAW);

        // init EBO
        let ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxInd), this.gl.STATIC_DRAW);

        // init full EBO
        let fillebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, fillebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(fullBoxInd), this.gl.STATIC_DRAW);

        //init VAO
        let vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);
        this.program.setAttrs();
        this.gl.bindVertexArray(null);
        
        this.buffers = {
            vbo: vbo,
            ebo: ebo,
            fillebo: fillebo,
            vao: vao,
            size: boxInd.length,
            fillsize: fullBoxInd.length,
        };
    }

    render(uniforms) {
        uniforms['mode'] = BoxMode.wireframe;

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

    renderFilled(uniforms) {
        uniforms['mode'] = BoxMode.filled;

        this.program.bind();

        this.gl.bindVertexArray(this.buffers.vao);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.vbo);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.fillebo);

        this.program.setUnifs(uniforms)

        this.gl.drawElements(this.gl.TRIANGLES, this.buffers.fillsize, this.gl.UNSIGNED_SHORT, 0);
        //console.log(this.gl.getError());

        this.gl.bindVertexArray(null);
        this.program.unbind();
    }

    delete(){
        console.log('passing delete for singleton unit box...');
    }
}