'use strict';

class StreamProgram extends Program {
    constructor(gl) {
        super(gl);
        DataManager.files({
            files: [
                Shader.dir + 'stream_vs.glsl',
                Shader.dir + 'stream_fs.glsl',
            ],
            success: (f) => {
                this.init(...f)
                this.setup();
            },
            fail: (r) => { console.error(r); },
        });

    }

    setup() {
        this.setupAttributes({
            position: 'vertPosition',
            normal: 'vertNormal',

            fieldPos0: 'fieldPosition0',
            fieldPos1: 'fieldPosition1',
            fieldPos2: 'fieldPosition2',
            fieldPos3: 'fieldPosition3',
            fieldVal0: 'fieldValue0',
            fieldVal1: 'fieldValue1',
            fieldVal2: 'fieldValue2',
            fieldVal3: 'fieldValue3',

            tLocal: 't_local',
            tGlobal: 't_global',
        });

        this.setupUniforms({
            //matrices
            model: 'mWorld',
            view: 'mView',
            proj: 'mProj',

            //stats and scaling
            median: 'medianSize',
            std: 'stdSize',

            //modifications
            light: 'light',
            brightness: 'brightness',
            thickness: 'thickness',
            appearance: 'appearance',
            scale: 'scale',
            time: 'time',

            //colormap
            colorMapSize: 'colorMapSize',
            colorMap0: 'colorMap[0]',
            colorMap1: 'colorMap[1]',
            colorMap2: 'colorMap[2]',
            colorMap3: 'colorMap[3]',
            colorMap4: 'colorMap[4]',
        });
    }


    setAttrs() {
        this.gl.useProgram(this.program);

        let attrs = [
            {
                attr: this.attributes.fieldPos0,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 0,
                size: 3,
            },
            {
                attr: this.attributes.fieldPos1,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 3 * Float32Array.BYTES_PER_ELEMENT,
                size: 3,
            },
            {
                attr: this.attributes.fieldPos2,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 6 * Float32Array.BYTES_PER_ELEMENT,
                size: 3,
            },
            {
                attr: this.attributes.fieldPos3,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 9 * Float32Array.BYTES_PER_ELEMENT,
                size: 3,
            },
            {
                attr: this.attributes.fieldVal0,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 12 * Float32Array.BYTES_PER_ELEMENT,
                size: 3,
            },
            {
                attr: this.attributes.fieldVal1,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 15 * Float32Array.BYTES_PER_ELEMENT,
                size: 3,
            },
            {
                attr: this.attributes.fieldVal2,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 18 * Float32Array.BYTES_PER_ELEMENT,
                size: 3,
            },
            {
                attr: this.attributes.fieldVal3,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 21 * Float32Array.BYTES_PER_ELEMENT,
                size: 3,
            },
            {
                attr: this.attributes.tGlobal,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 24 * Float32Array.BYTES_PER_ELEMENT,
                size: 4,
            },
        ]

        for (let attr of attrs) {
            this.gl.enableVertexAttribArray(attr.attr);
            this.gl.vertexAttribPointer(attr.attr, attr.size, this.gl.FLOAT, this.gl.FALSE, attr.stride, attr.offset);
            this.gl.vertexAttribDivisor(attr.attr, 1);
        }

        this.gl.useProgram(null);
    }

    setVertexPositionAttrs() {
        this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.attributes.position);
        this.gl.vertexAttribPointer(this.attributes.position, 3, this.gl.FLOAT, this.gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
        this.gl.useProgram(null);
    }

    setVertexNormalAttrs() {
        this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.attributes.normal);
        this.gl.vertexAttribPointer(this.attributes.normal, 3, this.gl.FLOAT, this.gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
        this.gl.useProgram(null);
    }

    setVertexTimeAttrs() {
        this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.attributes.tLocal);
        this.gl.vertexAttribPointer(this.attributes.tLocal, 1, this.gl.FLOAT, this.gl.FALSE, 1 * Float32Array.BYTES_PER_ELEMENT, 0);
        this.gl.useProgram(null);
    }

    setUnifs(options) {
        this.gl.uniformMatrix4fv(this.uniforms.model, this.gl.FALSE, options.model);
        this.gl.uniformMatrix4fv(this.uniforms.view, this.gl.FALSE, options.view);
        this.gl.uniformMatrix4fv(this.uniforms.proj, this.gl.FALSE, options.projection);

        this.gl.uniform1f(this.uniforms.median, options.median);
        this.gl.uniform1f(this.uniforms.std, options.std);

        this.gl.uniform3fv(this.uniforms.light, options.light);
        this.gl.uniform1f(this.uniforms.brightness, options.brightness);
        this.gl.uniform1i(this.uniforms.appearance, options.appearance);
        this.gl.uniform1f(this.uniforms.thickness, options.thickness);
        this.gl.uniform2fv(this.uniforms.time, options.time);
        this.gl.uniform1i(this.uniforms.scale, options.scale);

        this.gl.uniform1i(this.uniforms.colorMapSize, options.colorMapSize);
        this.gl.uniform4fv(this.uniforms.colorMap0, options.colorMap0);
        this.gl.uniform4fv(this.uniforms.colorMap1, options.colorMap1);
        this.gl.uniform4fv(this.uniforms.colorMap2, options.colorMap2);
        this.gl.uniform4fv(this.uniforms.colorMap3, options.colorMap3);
        this.gl.uniform4fv(this.uniforms.colorMap4, options.colorMap4);
    }
}