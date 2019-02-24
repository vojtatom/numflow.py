'use strict';

class Stream extends MethodPrimitive {
    constructor(gl, programs) {
        super(gl);

        this.program = programs.stream;
        this.box = new Box(this.gl, programs);

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
        let times = Primitive.base64totype(data.times);
        let lengths = Primitive.base64totype(data.lengths, DType.int);
        let segmentsCount = times.length - lengths.length;
        let streamsCount = lengths.length;
        let filled = 0;
        const segsize = 28;

        //console.log(positions, values, times, lengths);

        let vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);
        this.addBufferVAO(vao);
            
        //glyph positions
		let streambuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, streambuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, 
            segmentsCount * segsize * Float32Array.BYTES_PER_ELEMENT, 
            this.gl.STATIC_DRAW);
        this.addBufferVBO(streambuffer);


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

        this.program.bindAttrBigBuffer();
        this.sizes.instances = segmentsCount;

        this.initSegment(data.meta.sampling, data.meta.divisions);
        this.gl.bindVertexArray(null);
        
        //meta and stats
        this.metaFromData(data.meta, data.stats);
        this.appendMeta({
            size: data.meta.size + 1.0,
            time: [data.meta.t0, data.meta.tbound],
        });

        //init bounding box
        this.initBoundingBox(data);

        //Finish up...
        this.loaded = true;  
        console.log(this.gl.getError());
        console.log(this.program);
        console.log(this.meta);

        console.log(this.buffers);

        /*let getProgramInfo = function(gl, program) {
            var result = {
                attributes: [],
                uniforms: [],
                attributeCount: 0,
                uniformCount: 0
            },
                activeUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS),
                activeAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        
            // Taken from the WebGl spec:
            // http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.14
            var enums = {
                0x8B50: 'FLOAT_VEC2',
                0x8B51: 'FLOAT_VEC3',
                0x8B52: 'FLOAT_VEC4',
                0x8B53: 'INT_VEC2',
                0x8B54: 'INT_VEC3',
                0x8B55: 'INT_VEC4',
                0x8B56: 'BOOL',
                0x8B57: 'BOOL_VEC2',
                0x8B58: 'BOOL_VEC3',
                0x8B59: 'BOOL_VEC4',
                0x8B5A: 'FLOAT_MAT2',
                0x8B5B: 'FLOAT_MAT3',
                0x8B5C: 'FLOAT_MAT4',
                0x8B5E: 'SAMPLER_2D',
                0x8B60: 'SAMPLER_CUBE',
                0x1400: 'BYTE',
                0x1401: 'UNSIGNED_BYTE',
                0x1402: 'SHORT',
                0x1403: 'UNSIGNED_SHORT',
                0x1404: 'INT',
                0x1405: 'UNSIGNED_INT',
                0x1406: 'FLOAT'
            };
        
            // Loop through active uniforms
            for (var i=0; i < activeUniforms; i++) {
                var uniform = gl.getActiveUniform(program, i);
                uniform.typeName = enums[uniform.type];
                result.uniforms.push(uniform);
                result.uniformCount += uniform.size;
            }
        
            // Loop through active attributes
            for (var i=0; i < activeAttributes; i++) {
                var attribute = gl.getActiveAttrib(program, i);
                attribute.typeName = enums[attribute.type];
                result.attributes.push(attribute);
                result.attributeCount += attribute.size;
            }
        
            return result;
        }

        console.table(getProgramInfo(this.gl, this.program.program).uniforms);*/
        
    }

    initSegment(sampling, divisions){
        let vert = Geometry.streamVert(sampling, divisions); 
        let norm = Geometry.streamNorm(sampling, divisions);
        let t = Geometry.streamLocalT(sampling, divisions);

        // init VBO for stream positions
		let positions = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positions);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vert), this.gl.STATIC_DRAW);
        this.addBufferVBO(positions);
        this.program.bindAttrPosition();

        // init VBO for stream normals
		let normals = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normals);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(norm), this.gl.STATIC_DRAW); 
        this.addBufferVBO(normals);
        this.program.bindAttrNormal();

        // init VBO for stream local time
		let times = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, times);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(t), this.gl.STATIC_DRAW); 
        this.addBufferVBO(times);
        this.program.bindAttrTime();

        this.sizes.instanceSize = vert.length / 3;
    }

    render(camera, light){
        if(!this.isRenderReady)
            return;

        this.program.bind();
        this.bindBuffersAndTextures();

        let uniforms = this.uniformDict(camera, light);
        //console.log(uniforms);
        this.program.bindUniforms(uniforms);

        //console.log(this.sizes.instanceSize, this.sizes.instances);
        this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, this.sizes.instanceSize, this.sizes.instances);
        console.log(this.gl.getError());

        this.gl.bindVertexArray(null);
        this.program.unbind();
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
                value: 'meta' in this ? Appearance.decode(this.meta.appearance): this._data.meta.appearance,
            },
            size: {
                type: 'slider',
                min: 0.01,
                max: 10,
                delta: 0.01,
                value: 'meta' in this ? this.meta.size: this._data.meta.size,
                callback: (value) => { this.meta.size = value + 1.0 },
            }
        }
    }
}