'use strict';

class Glyphs extends Primitive {
    constructor(gl) {
        super(gl);
        this.program = new GlyphProgram(gl);
        this.loaded = false;
        this.buffers = {};

        this.model = mat4.create();
    }

    init(data = null){
        //Belated initialization...
        if (!this.isInitReady(data))
            return;
        data = this.lateLoadData(data);

        //Actual initialization
        //load base64 data
        let positions = Primitive.base64totype(data.points);
        let values = Primitive.base64totype(data.values);

        let vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);
            
        //glyph positions
		let positionsVbo = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionsVbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
        this.program.setGlyphPositionAttrs();
        
        //glyph values
        let valuesVbo = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, valuesVbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, values, this.gl.STATIC_DRAW);    
        this.program.setValueAttrs();
        
        this.buffers['field'] = {
            positions: positionsVbo,
            values: valuesVbo,
            vao: vao,
            size: positions.length / 3,
        };
        
        this.initLineGlyph();
        this.gl.bindVertexArray(null);

        //Calculate stats
        let lengths = new Float32Array(values.length / 3);

        for (let i = 0; i < values.length; i += 3){
            let length = values[i] * values[i] + values[i + 1] * values[i + 1] + values[i + 2] * values[i + 2];
            length = length;
            lengths[i / 3] =  Math.sqrt(length);
        }

        console.log(data.meta);
        this.meta = {
            std: meanAbsoluteDeviation(lengths),
            median: median(lengths),
            size: data.meta.size,
            colormap: {
                sampling: data.meta.colormap.sampling,
                colors: [
                    vec4.fromValues(...data.meta.colormap.colors[0]),
                    vec4.fromValues(...data.meta.colormap.colors[1]),
                    vec4.fromValues(...data.meta.colormap.colors[2]),
                    vec4.fromValues(...data.meta.colormap.colors[3]),
                    vec4.fromValues(...data.meta.colormap.colors[4]),
                ] 
            },
            appearance: Geometry.appearance[data.meta.appearance],
            scale: Geometry.scale[data.meta.scale],
        }

        //setup transparency
        this.transparent = (Geometry.appearance[data.meta.appearance] === Geometry.appearance.transparent);
        console.log(this.transparent);

        //init bounding box
        this.initBoundingBox(data);

        //Finish up...
        this.loaded = true;  
        console.log(this.gl.getError());
    }

    initLineGlyph(){
        let lineVert = Geometry.glyphVert;
        let lineNorm = Geometry.glyphNorm;

        // init VBO for glyph positions
		let positions = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positions);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(lineVert), this.gl.STATIC_DRAW);

        this.program.setVertexPositionAttrs();

        // init VBO for glyph normals
		let normals = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normals);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(lineNorm), this.gl.STATIC_DRAW); 
        
        this.program.setVertexNormalAttrs();
		
		this.buffers['glyph'] = {
			positions: positions,
			nomrals: normals,
			size: lineVert.length,
        };
        
        //console.log(this.program);
    }

    render(camera, light){
        if(!this.isRenderReady)
            return;

        this.program.bind();
        this.gl.bindVertexArray(this.buffers.field.vao);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.field.positions);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.field.values);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.glyph.positions);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.glyph.normals);
        //this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.glyph.ebo);

        this.program.setUnifs({
            model: this.model,
            view: camera.view,
            projection: camera.projection,

            median: this.meta.median,
            std: this.meta.std,
            size: this.meta.size,

            light: light.position,
            brightness: 1.0,
            appearance: this.meta.appearance,
            scale: this.meta.scale,

            colorMapSize: this.meta.colormap.sampling,
            colorMap0: this.meta.colormap.colors[0],
            colorMap1: this.meta.colormap.colors[1],
            colorMap2: this.meta.colormap.colors[2],
            colorMap3: this.meta.colormap.colors[3],
            colorMap4: this.meta.colormap.colors[4],
        });

        this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, this.buffers.glyph.size / 3, this.buffers.field.size);
        //console.log(this.gl.getError());

        this.gl.bindVertexArray(null);
        this.program.unbind();
    }

    delete(){
        
    }
}