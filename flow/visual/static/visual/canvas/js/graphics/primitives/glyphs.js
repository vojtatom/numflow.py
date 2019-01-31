'use strict';

class Glyphs extends Primitive {
    constructor(gl) {
        super(gl);
        this.program = new GlyphProgram(gl);
        this.box = new Box(this.gl);

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
        this.program.setFieldPositionAttrs();
        
        //glyph values
        let valuesVbo = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, valuesVbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, values, this.gl.STATIC_DRAW);    
        this.program.setFieldValueAttrs();
        
        this.buffers['field'] = {
            positions: positionsVbo,
            values: valuesVbo,
            vao: vao,
            size: positions.length / 3,
        };
        
        this.initGlyph(data.meta.geometry, data.meta.sampling);
        this.gl.bindVertexArray(null);

        //Calculate stats
        let lengths = new Float32Array(values.length / 3);

        for (let i = 0; i < values.length; i += 3){
            let length = values[i] * values[i] + values[i + 1] * values[i + 1] + values[i + 2] * values[i + 2];
            length = length;
            lengths[i / 3] =  Math.sqrt(length);
        }

        this.meta = {
            std: meanAbsoluteDeviation(lengths),
            median: median(lengths),
            size: data.meta.size,
            geometry: data.meta.geometry,
            sampling: data.meta.sampling,
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
            appearance: Appearance.encode[data.meta.appearance],
            scale: Scale.encode[data.meta.scale],
        }

        //init bounding box
        this.initBoundingBox(data);

        //Finish up...
        this.loaded = true;  
        console.log(this.gl.getError());
    }

    initGlyph(geometry, sampling){
        let lineVert, lineNorm;
        if (geometry === 'line'){
            lineVert = Geometry.glyphVertLine(sampling);
            lineNorm = Geometry.glyphNormLine(sampling);
        } else if (geometry === 'cone'){
            lineVert = Geometry.glyphVertCone(sampling);
            lineNorm = Geometry.glyphNormCone(sampling); 
        }

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
			normals: normals,
			size: lineVert.length / 3,
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

        this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, this.buffers.glyph.size, this.buffers.field.size);
        //console.log(this.gl.getError());

        this.gl.bindVertexArray(null);
        this.program.unbind();
    }

    get ui(){
        return {
            type: {
                type: 'display',
                value: 'glyphs',
            },
            appearance: {
                type: 'select',
                options: ['solid', 'transparent'],
                callbacks: [
                    () => {this.meta.appearance = Appearance.solid}, 
                    () => {this.meta.appearance = Appearance.transparent},
                ],
                value: 'meta' in this ? Appearance.encode[this.meta.appearance]: this._data.meta.appearance,
            },
            size: {
                type: 'slider',
                min: 0.1,
                max: 10,
                delta: 0.1,
                value: 'meta' in this ? this.meta.size: this._data.meta.size,
                callback: (value) => { this.meta.size = value },
            }
        }
    }

    delete(){
        this.gl.deleteBuffer(this.buffers.field.positions);
        this.gl.deleteBuffer(this.buffers.field.values);
        this.gl.deleteBuffer(this.buffers.glyph.positions);
        this.gl.deleteBuffer(this.buffers.glyph.normals);
        this.gl.deleteVertexArray(this.buffers.field.vao);
    }
}