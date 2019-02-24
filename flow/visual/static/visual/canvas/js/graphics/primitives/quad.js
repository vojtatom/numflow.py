'use strict';

class Quad extends Primitive {
    constructor(gl, programs) {
        super(gl);
        this.program = programs.text;
        this.loaded = false;
        this.buffers = {};

        this.model = mat4.create();
        this.size = vec2.create();
    }

    init(data = null) {
        //Belated initialization...
        //console.log(this.loaded, this._data, this.program.loaded);
        //console.log('init quad');
        if (!this.isInitReady(data))
            return;
        data = this.lateLoadData(data);

        let geometry = Geometry.unitQuad;
        let uv = Geometry.unitQuadTex;

        let vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);

        // init VBO for positions
		let positions = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positions);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(geometry), this.gl.STATIC_DRAW);

        this.program.setAttrsPosition();

        // init VBO for texcoord
		let texcoord = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texcoord);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(uv), this.gl.STATIC_DRAW);

        this.program.setAttrsTexcoord();

        this.buffers = {
            vao: vao,
            positions: positions,
            texcoord: texcoord,
        };

        
        //////////////////////////////////
        
        let textCtx = document.createElement("canvas").getContext("2d");
        
        // Puts text in center of canvas.
        function makeTextCanvas(text, width, height) {
            textCtx.canvas.width  = width;
            textCtx.canvas.height = height;
            textCtx.font = "20px monospace";
            textCtx.textAlign = "center";
            textCtx.textBaseline = "middle";
            textCtx.fillStyle = "white";
            textCtx.strokeStyle = 'white';
            textCtx.lineWidth = 5;
            textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
            textCtx.fillText(text, width / 2, height / 2);
            return textCtx.canvas;
        }
        

        // create text texture.
        let value = data.value < 100 ? data.value.toFixed(2) : data.value.toExponential(3);
        let textCanvas = makeTextCanvas(value, 200, 50);
        let textWidth  = textCanvas.width;
        let textHeight = textCanvas.height;
        let textTex = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, textTex);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textCanvas);
        // make sure we can render it even if it's not a power of 2
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        
       
        mat4.fromTranslation(this.model, data.position);
        this.size = vec2.fromValues(textWidth, textHeight);

        
        this.meta = {
            texture: textTex,
        };

        this.loaded = true;
        this._data = null;
        this.gl.bindVertexArray(null);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    render(camera, light) {
        if(!this.isRenderReady)
            return;

        this.program.bind();
        this.gl.bindVertexArray(this.buffers.vao);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.positions);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.texcoord);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.meta.texture);

        this.program.setUnifs({
            model: this.model,
            view: camera.view,
            projection: camera.projection,
            texture: this.meta.texture,
            
            size: this.size,
            screenSize: camera.screenDim,
        });

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        //console.log(this.gl.getError());

        this.gl.bindVertexArray(null);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.program.unbind();
    }
}