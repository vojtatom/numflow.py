'use strict';

class Layer extends Primitive {
    constructor(gl) {
        super(gl);
        this.program = new LayerProgram(gl);
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
        let elements = Geometry.layerElements(data.meta.geometry.sampling, data.meta.geometry.normal);

        let vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);
            
        //positions
		let positionsVbo = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionsVbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
        this.program.setFieldPositionAttrs();
        
        //values
        let valuesVbo = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, valuesVbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, values, this.gl.STATIC_DRAW);    
        this.program.setFieldValueAttrs();

        //elements
        let ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(elements), this.gl.STATIC_DRAW);

        this.buffers = {
            positions: positionsVbo,
            values: valuesVbo,
            ebo: ebo,
            vao: vao,
            size: elements.length,
        };
        
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
            thickness: data.meta.thickness,
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
            normal: [[1, 0, 0], [0, 1, 0], [0, 0, 1]][data.meta.geometry.normal],
            appearance: Appearance.encode[data.meta.appearance],
            scale: Scale.encode[data.meta.scale],
        }

        //init bounding box
        this.initBoundingBox(data);

        //Finish up...
        this.loaded = true;  
        console.log(this.gl.getError());
    }

    render(camera, light){
        if(!this.isRenderReady)
            return;

        this.program.bind();
        this.gl.bindVertexArray(this.buffers.vao);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.positions);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.values);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.ebo);

        this.program.setUnifs({
            normal: this.meta.normal,

            model: this.model,
            view: camera.view,
            projection: camera.projection,

            cameraPosition: camera.pos,

            median: this.meta.median,
            std: this.meta.std,
            thickness: this.meta.thickness,

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

        this.gl.drawElements(this.gl.TRIANGLES, this.buffers.size, this.gl.UNSIGNED_INT, 0);
        //console.log(this.gl.getError());

        this.gl.bindVertexArray(null);
        this.program.unbind();
    }

    get ui(){
        return {
            type: {
                type: 'display',
                value: 'plane',
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
            /*thickness: {
                type: 'slider',
                min: 0.1,
                max: 10,
                delta: 0.1,
                value: 'meta' in this ? this.meta.thickness: this._data.meta.thickness,
                callback: (value) => { this.meta.thickness = value },
            }*/
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