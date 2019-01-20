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
        if (!this.program.loaded){
            this._data = data;
            return;
        }

        if (data === null){
            data = this._data;
            this._data = null;
        }


        //Actual initialization
        let positions = Primitive.base64tofloat32(data.points);
        let values = Primitive.base64tofloat32(data.values);

        this.program.bind();
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
        this.program.unbind();

        //Calculate stats
        let lengths = new Float32Array(values.length / 3);

        for (let i = 0; i < values.length; i += 3){
            let length = values[i] * values[i] + values[i + 1] * values[i + 1] + values[i + 2] * values[i + 2];
            length = length;
            lengths[i / 3] =  Math.sqrt(length);
        }

        let delta;
        if (positions.length > 2){
            let arr = [positions[3] - positions[0], 
                        positions[4] - positions[1],
                        positions[5] - positions[2]];
            //get smalles NONZERO number
            delta = Math.min.apply(null, arr.filter(Boolean));
        } else {
            delta = 1;
        }

        this.stats = {
            std: meanAbsoluteDeviation(lengths),
            median: median(lengths),
            delta: delta,
        }

        //Finish up...
        this.loaded = true;  
        console.log(this.gl.getError());
    }

    initLineGlyph(){
        let l = 0.1;
        let m = 1;

        var lineVert = [
            m, l, l,
            m, l, 0,
            0, l, 0,
            0, l, l,
            m, 0, l,
            m, 0, l,
            0, 0, 0,
            0, 0, l
        ];

        var lineInd = [
            0, 1, 2,
            0, 2, 3,
            0, 5, 1,
            0, 4, 5,
            4, 6, 5,
            4, 7, 6,
            7, 2, 6,
            7, 3, 2,
            0, 7, 4,
            0, 3, 7,
            5, 2, 1,
            5, 6, 2,
        ];

        // init VBO for glyph
		let vbo = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(lineVert), this.gl.STATIC_DRAW);

		// init EBO for glyph
		let ebo = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(lineInd), this.gl.STATIC_DRAW);
        
        this.program.setVertexPositionAttrs();
		
		this.buffers['glyph'] = {
			vbo: vbo,
			ebo: ebo,
			size: lineInd.length,
		};
    }

    render(camera){
        if (!this.program.loaded)
            return;

        if (!this.loaded)
            this.init();

        this.program.bind();
        this.gl.bindVertexArray(this.buffers.field.vao);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.field.positions);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.field.values);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.glyph.vbo);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.glyph.ebo);

        this.program.setUnifs({
            model: this.model,
            view: camera.view,
            projection: camera.projection,
            median: this.stats.median,
            std: this.stats.std,
            size: this.stats.delta,
            brightness: 1.0,
        })

        this.gl.drawElementsInstanced(this.gl.TRIANGLES, this.buffers.glyph.size, this.gl.UNSIGNED_SHORT, 0, this.buffers.field.size);
        //console.log(this.gl.getError());

        this.gl.bindVertexArray(null);
        this.program.unbind();
    }

    delete(){
        
    }
}