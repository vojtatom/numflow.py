'use strict';

class Glyphs extends MethodPrimitive {
    constructor(gl, programs) {
        super(gl, programs);
        
        this.program = programs.glyph;
        this.loaded = false;

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

        //init VAO
        let vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);
        this.addBufferVAO(vao);
    
        //glyph positions
		let positionsVbo = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionsVbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
        this.addBufferVBO(positionsVbo);
        this.program.bindAttrFieldPosition();
 
        //glyph values
        let valuesVbo = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, valuesVbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, values, this.gl.STATIC_DRAW);  
        this.addBufferVBO(valuesVbo);  
        this.program.bindAttrFieldValue();

        //sizes setup
        this.sizes.instances = positions.length / 3;
        
        //init glyph
        this.initGlyph(data.meta.geometry, data.meta.sampling);
        this.gl.bindVertexArray(null);

        //setup class meta info
        this.metaFromData(data.meta, data.stats);
        this.appendMeta({
            size: data.meta.size,
            mode: CoordMode.encode('xyz'),
        });

        //init bounding box
        this.initBoundingBox(data);
        this.initColorbar(data);

        //Finish up...
        this.loaded = true;  
        //console.log(this.gl.getError());
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
        this.addBufferVBO(positions);
        this.program.bindAttrVertexPosition();

        // init VBO for glyph normals
		let normals = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normals);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(lineNorm), this.gl.STATIC_DRAW); 
        this.addBufferVBO(normals);
        this.program.bindAttrVertexNormal();
        
        //sizes setup
        this.sizes.instanceSize = lineVert.length / 3;
        //console.log(this.program);
    }

    render(camera, light){
        if(!this.isRenderReady)
            return;

        if(!this.meta.visible)
            return;

        //this.program.bind();
        this.bindBuffersAndTextures();
        
        //create uniforms
        let uniforms = this.uniformDict(camera, light, this.meta.mode);
        //console.log(uniforms);
        this.program.bindUniforms(uniforms);

        this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, this.sizes.instanceSize, this.sizes.instances);
        //console.log(this.gl.getError());

        this.gl.bindVertexArray(null);
        //this.program.unbind();
    }

    get ui(){
        return Object.assign({}, {
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
                value: 'meta' in this ? Appearance.decode(this.meta.appearance): this._data.meta.appearance,
            },
            size: {
                type: 'slider',
                min: 0.1,
                max: 10,
                delta: 0.01,
                value: 'meta' in this ? this.meta.size: this._data.meta.size,
                callback: (value) => { this.meta.size = value },
            },
        }, super.ui);
    }
}