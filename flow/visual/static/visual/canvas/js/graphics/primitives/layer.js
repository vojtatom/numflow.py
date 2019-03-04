'use strict';

class Layer extends MethodPrimitive {
    constructor(gl, programs) {
        super(gl, programs);

        this.program = programs.layer;
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
        let elements = Geometry.layerElements(data.meta.geometry.sampling, data.meta.geometry.normal);

        //setup vao
        let vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);
        this.addBufferVAO(vao);
            
        //positions
		let positionsVbo = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionsVbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
        this.addBufferVBO(positionsVbo);
        this.program.bindAttrPosition();
        
        //values
        let valuesVbo = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, valuesVbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, values, this.gl.STATIC_DRAW);    
        this.addBufferVBO(valuesVbo);
        this.program.bindAttrValue();

        //elements
        let ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(elements), this.gl.STATIC_DRAW);
        this.addBufferEBO(ebo);

        this.sizes.instanceSize = elements.length;
        this.gl.bindVertexArray(null);

        //Calculate stats
        this.metaFromData(data.meta, data.stats);
        this.appendMeta({
            normal: [[1, 0, 0], [0, 1, 0], [0, 0, 1]][data.meta.geometry.normal],
            mode: CoordMode.encode('xyz'),
        });

        //init bounding box
        this.initBoundingBox(data);
        this.initColorbar(data);

        //Finish up...
        this.loaded = true;  
        //console.log(this.gl.getError());
    }

    render(camera, light){
        if(!this.isRenderReady)
            return;

        if(!this.meta.visible)
            return;

        //this.program.bind();
        this.bindBuffersAndTextures();

        let uniforms = this.uniformDict(camera, light, this.meta.mode);
        uniforms['cameraPosition'] = camera.pos;
        this.program.bindUniforms(uniforms);
        

        this.gl.drawElements(this.gl.TRIANGLES, this.sizes.instanceSize, this.gl.UNSIGNED_INT, 0);
        //console.log(this.gl.getError());

        this.gl.bindVertexArray(null);
        //this.program.unbind();
    }

    get ui(){
        return Object.assign({}, {
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
                value: 'meta' in this ? Appearance.decode(this.meta.appearance): this._data.meta.appearance,
            },
        }, super.ui);
    }
}