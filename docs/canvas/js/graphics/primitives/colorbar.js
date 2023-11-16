'use strict';

class ColorbarMode{
    static get optical(){
        return 0;
    }

    static get complete(){
        return 1;
    }

    static decode(mode){
        return ['optical', 'complete'][mode];
    }

    static encode(mode){
        return {
            optical: 0,
            static: 1,
        }[mode];
    }
}

class Colorbar extends ColorPrimitive {
    constructor(gl, programs) {
        super(gl);
        this.program = programs.colorbar;
        this.programs = programs;

        this.loaded = false;
        this.model = mat4.create();
        this.labels = {};
    }

    init(data = null){
        //Belated initialization...
        if (!this.isInitReady(data))
            return;
        data = this.lateLoadData(data);

        //Actual initialization
        //load base64 data
        this.colorMapSamples = 100;
        let positions = Geometry.colorbar(this.colorMapSamples);

        //setup vao
        let vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);
        this.addBufferVAO(vao);
            
        //positions
		let positionsVbo = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionsVbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
        this.addBufferVBO(positionsVbo);
        this.program.bindAttrPosition();

        this.sizes.instanceSize = positions.length / 3;
        this.gl.bindVertexArray(null);

        //Calculate stats
        this.metaFromData(data.meta, data.stats);
        this.appendMeta({
            barSize: [0.01, 0.25],
            barPos: [0.05, 0.1],
            colorMapSize: data.meta.colormap.sampling,
            colorMapSamples: this.colorMapSamples,
            colorMap0: vec4.fromValues(...data.meta.colormap.colors[0]),
            colorMap1: vec4.fromValues(...data.meta.colormap.colors[1]),
            colorMap2: vec4.fromValues(...data.meta.colormap.colors[2]),
            colorMap3: vec4.fromValues(...data.meta.colormap.colors[3]),
            colorMap4: vec4.fromValues(...data.meta.colormap.colors[4]),

            //save only values
            stats: data.stats.values,
            gamma: 1.0,
            colorMode: ColorbarMode.optical,
        });

        //Finish up...
        this.loaded = true;  
        //console.log(this.gl.getError());
        for(let mode in data.stats.values){
            this.labels[mode] = this.setupLabels(data.stats.values[mode].minSize, data.stats.values[mode].maxSize);
        }
    }

    setupLabels(min, max){
        //min
        let labelMax = new Quad(this.gl, this.programs);
        let maxPos = 1 - this.meta.barPos[1];
        labelMax.init({
            position: [this.meta.barPos[0] + this.meta.barSize[0] * 2 - 1, maxPos, 0],
            value: max,
            space: TextMode.screenSpace,
        });

        //max
        let labelMin = new Quad(this.gl, this.programs);
        let minPos = 1 - (this.meta.barPos[1] + this.meta.barSize[1] * 2);
        labelMin.init({
            position: [this.meta.barPos[0] + this.meta.barSize[0] * 2 - 1, minPos, 0],
            value: min,
            space: TextMode.screenSpace,
        });

        //mid
        let labelZero = new Quad(this.gl, this.programs);
        let zeroPos = min * max < 0 ?  maxPos - (max / (max - min)) * (maxPos - minPos) : 2.0;
        labelZero.init({
            position: [this.meta.barPos[0] + this.meta.barSize[0] * 2 - 1, zeroPos, 0],
            value: 0.0,
            space: TextMode.screenSpace,
        });

        return [labelMax, labelMin, labelZero];
    }

    render(camera, light, mode){
        if(!this.isRenderReady)
            return;

        //this.program.bind();
        this.bindBuffersAndTextures();

        let uniforms = this.uniformDict(camera, light, this.meta.mode);
        uniforms['screenSize'] = camera.screenDim;
        uniforms = Object.assign({}, uniforms, this.meta.stats[CoordMode.decode(mode)]);
        this.program.bindUniforms(uniforms);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.sizes.instanceSize);
        //console.log(this.gl.getError());

        this.gl.bindVertexArray(null);
        //this.program.unbind();
    }

    renderLabels(camera, light, mode){
        for(let label of this.labels[CoordMode.decode(mode)]){
            label.render(camera, light);
        }
    }
}