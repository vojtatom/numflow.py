'use strict';

class Stream extends MethodPrimitive {
    constructor(gl, programs) {
        super(gl);

        this.program = programs.stream;
        this.box = new Box(this.gl, programs);

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
        let times = Primitive.base64totype(data.times);
        let lengths = Primitive.base64totype(data.lengths, DType.int);
        let segmentsCount = times.length - lengths.length;
        let streamsCount = lengths.length;
        let filled = 0;
        const segsize = 28;

        //console.log(positions, values, times, lengths);

        let vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);
            
        //glyph positions
		let streambuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, streambuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, 
            segmentsCount * segsize * Float32Array.BYTES_PER_ELEMENT, 
            this.gl.STATIC_DRAW);


        //offset in positions and values array
        let poffset = 0;
        let voffset = 0;
        //offset in time array
        let toffset = 0;

        let copyVector = function(invec, outvec, inoffset, outoffset, veclen){
            for(let i = 0; i < veclen; ++i){
                outvec[outoffset + i] = invec[inoffset + i];
            }
        }

        //setup each streamline
        for (let i = 0; i < streamsCount; ++i){
            //lengths[i] - 1 == segment count
            let buffer = new Float32Array((lengths[i] - 1) * segsize);
            let streamLength = lengths[i];
            let streamSegments = streamLength - 1;
            //offset in buffer
            let boffset = 0;

            let zeroPosition = [];
            let zeroValue = [];
            let finalPosition = [];
            let finalValue = [];

            //for multiusage
            let tmpoffset;

            //extrapolate positions and values of the first
            for (let o = 0; o < 3; ++o){
                //offset of the first vertex
                tmpoffset = poffset + o;
                zeroPosition.push(positions[tmpoffset] + (positions[tmpoffset] - positions[tmpoffset + 3]));
                zeroValue.push(values[tmpoffset] + (values[tmpoffset] - values[tmpoffset + 3]));
            }

            //extrapolate positions and values of the last
            for (let o = 0; o < 3; ++o){
                //offset of the last vertex
                tmpoffset = poffset + o + (streamLength - 1) * 3;
                //minus 3 to get last-but-one
                finalPosition.push(positions[tmpoffset] + (positions[tmpoffset] - positions[tmpoffset - 3]));
                finalValue.push(values[tmpoffset] + (values[tmpoffset] - values[tmpoffset - 3]));
            }

            let zeroTime = times[toffset] + (times[toffset] - times[toffset + 1]);
            let finalTime = times[toffset + streamLength - 1] + (times[toffset + streamLength - 1] - times[toffset + streamLength - 2]);

            //console.log(poffset, voffset);
            /*setup each segment with structure:
             *
             * ...|p0 xyz|p1 xyz|p2 xyz|p3 xyz|v0 xyz|v1 xyz|v2 xyz|v3 xyz|t0123|...
             *     0      3      6      9      12     15     18     21     24
             * 
             * positions and values with stride 25
             * time with stride 24 
             */
            for (let s = 0; s < streamSegments; ++s){

                //each slice of position and value
                //copy them at once
                for (let p = 0; p < 4; ++p){
                    if (s == 0 && p == 0) {
                        //copy first
                        copyVector(zeroPosition, buffer, 0, boffset, 3);
                        copyVector(zeroValue, buffer, 0, boffset + 12, 3);
                        buffer[boffset + 24] = zeroTime;
                    } else if (s == (streamSegments - 1) && p == 3) {
                        //copy last
                        copyVector(finalPosition, buffer, 0, boffset + 9, 3);
                        copyVector(finalValue, buffer, 0, boffset + 21, 3);
                        buffer[boffset + 27] = finalTime;
                    } else {
                        //copy any other
                        copyVector(positions, buffer, poffset, boffset + 3 * p, 3);
                        copyVector(values, buffer, voffset, boffset + 12 + 3 * p, 3);
                        buffer[boffset + 24 + p] = times[toffset];
                        //console.log(s, positions[poffset], positions[poffset + 1], positions[poffset + 2]);

                        //move head over what was read
                        voffset += 3;
                        poffset += 3;
                        toffset += 1;
                    }
                }
                //move 3 slides back (one window is 4 slides)
                boffset += 28;
                voffset -= 9;
                poffset -= 9;
                toffset -= 3;
            }
            //move 3 slides forward
            poffset += 9;
            voffset += 9;
            toffset += 3;

            //append to buffer 
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, filled, buffer);
            filled += buffer.length * Float32Array.BYTES_PER_ELEMENT;
            buffer = null;
        }

        this.program.setAttrs();

        this.initSegment(data.meta.sampling, data.meta.divisions);
        this.gl.bindVertexArray(null);
        console.log(this.gl.getError());

        this.buffers['field'] = {
            buffer: streambuffer,
            vao: vao,
            size: segmentsCount,
        };

        //Calculate stats
        let valueLengths = new Float32Array(values.length / 3);

        for (let i = 0; i < values.length; i += 3){
            let length = values[i] * values[i] + values[i + 1] * values[i + 1] + values[i + 2] * values[i + 2];
            length = length;
            valueLengths[i / 3] =  Math.sqrt(length);
        }

        this.meta = {
            stats: data.stats.values,

            thickness: data.meta.thickness + 1.0,
            sampling: data.meta.sampling,
            divisions: data.meta.divisions,
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
            timeLimits: [data.meta.t0, data.meta.tbound],

            scaleFactor: data.stats.points.scale_factor,
            shift: data.stats.points.center,
        }

        //init bounding box
        this.initBoundingBox(data);

        //Finish up...
        this.loaded = true;  
        //console.log(this.gl.getError());
        //console.log(this.program);
        //console.log(this.meta);
        
    }

    initSegment(sampling, divisions){
        let vert = Geometry.streamVert(sampling, divisions); 
        let norm = Geometry.streamNorm(sampling, divisions);
        let t = Geometry.streamLocalT(sampling, divisions);

        // init VBO for stream positions
		let positions = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positions);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vert), this.gl.STATIC_DRAW);

        this.program.setVertexPositionAttrs();

        // init VBO for stream normals
		let normals = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normals);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(norm), this.gl.STATIC_DRAW); 
        
        this.program.setVertexNormalAttrs();

        // init VBO for stream local time
		let times = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, times);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(t), this.gl.STATIC_DRAW); 

        this.program.setVertexTimeAttrs();
		
		this.buffers['segment'] = {
			positions: positions,
            normals: normals,
            times: times,
			size: vert.length / 3,
        };
    }

    get ui(){
        return {
            type: {
                type: 'display',
                value: 'streamlines',
            },
            appearance: {
                type: 'select',
                options: ['solid', 'transparent'],
                callbacks: [
                    () => {this.meta.appearance = Appearance.solid}, 
                    () => {this.meta.appearance = Appearance.transparent},
                ],
                value: 'meta' in this ? Appearance.decode[this.meta.appearance]: this._data.meta.appearance,
            },
            thickenss: {
                type: 'slider',
                min: 0.1,
                max: 10,
                delta: 0.1,
                value: 'meta' in this ? this.meta.thickness: this._data.meta.thickness,
                callback: (value) => { this.meta.thickness = value + 1.0 },
            }
        }
    }

    render(camera, light){
        if(!this.isRenderReady)
            return;

        this.program.bind();
        this.gl.bindVertexArray(this.buffers.field.vao);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.field.streambuffer);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.segment.positions);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.segment.normals);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.segment.times);

        this.program.setUnifs({
            model: this.model,
            view: camera.view,
            projection: camera.projection,

            median: this.meta.stats.xyz.median,
            std: this.meta.stats.xyz.std,
            thickness: this.meta.thickness,

            light: light.position,
            brightness: 1.0,
            appearance: this.meta.appearance,
            thickness: 0.1 * this.meta.thickness,
            scale: this.meta.scale,
            time: this.meta.timeLimits,

            colorMapSize: this.meta.colormap.sampling,
            colorMap0: this.meta.colormap.colors[0],
            colorMap1: this.meta.colormap.colors[1],
            colorMap2: this.meta.colormap.colors[2],
            colorMap3: this.meta.colormap.colors[3],
            colorMap4: this.meta.colormap.colors[4],

            scaleFactor: this.meta.scaleFactor,
            shift: this.meta.shift,
        });

        this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, this.buffers.segment.size, this.buffers.field.size);
        //console.log(this.gl.getError());

        this.gl.bindVertexArray(null);
        this.program.unbind();
    }

    delete(){
        this.gl.deleteBuffer(this.buffers.field.buffer);
        this.gl.deleteBuffer(this.buffers.segment.positions);
        this.gl.deleteBuffer(this.buffers.segment.normals);
        this.gl.deleteBuffer(this.buffers.segment.times);3
        this.gl.deleteVertexArray(this.buffers.field.vao);
    }
}