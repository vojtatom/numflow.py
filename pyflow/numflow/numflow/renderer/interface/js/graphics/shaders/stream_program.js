'use strict';

class StreamProgram extends MethodProgram {
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

        this.commonUniforms();
        this.setupUniforms({
            size: {
                name: 'size',
                type: this.GLType.float,
            },
            time: {
                name: 'time',
                type: this.GLType.vec2,
            },
            
        });
    }


    bindAttrBigBuffer() {
        this.gl.useProgram(this.program);
        let attrs = [
            {
                attribute: this.attributes.fieldPos0,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 0,
                size: 3,
                divisor: 1,
            },
            {
                attribute: this.attributes.fieldPos1,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 3 * Float32Array.BYTES_PER_ELEMENT,
                size: 3,
                divisor: 1,
            },
            {
                attribute: this.attributes.fieldPos2,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 6 * Float32Array.BYTES_PER_ELEMENT,
                size: 3,
                divisor: 1,
            },
            {
                attribute: this.attributes.fieldPos3,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 9 * Float32Array.BYTES_PER_ELEMENT,
                size: 3,
                divisor: 1,
            },
            {
                attribute: this.attributes.fieldVal0,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 12 * Float32Array.BYTES_PER_ELEMENT,
                size: 3,
                divisor: 1,
            },
            {
                attribute: this.attributes.fieldVal1,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 15 * Float32Array.BYTES_PER_ELEMENT,
                size: 3,
                divisor: 1,
            },
            {
                attribute: this.attributes.fieldVal2,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 18 * Float32Array.BYTES_PER_ELEMENT,
                size: 3,
                divisor: 1,
            },
            {
                attribute: this.attributes.fieldVal3,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 21 * Float32Array.BYTES_PER_ELEMENT,
                size: 3,
                divisor: 1,
            },
            {
                attribute: this.attributes.tGlobal,
                stride: 28 * Float32Array.BYTES_PER_ELEMENT,
                offset: 24 * Float32Array.BYTES_PER_ELEMENT,
                size: 4,
                divisor: 1,
            },
        ];

        for (let attr of attrs) {
            this.bindAttribute(attr);
        }

        this.gl.useProgram(null);
    }

    bindAttrPosition() {
        this.gl.useProgram(this.program);
        this.bindAttribute({
            attribute: this.attributes.position,
            size: 3,
            stride: 3 * Float32Array.BYTES_PER_ELEMENT,
            offfset: 0,
        });
        this.gl.useProgram(null);
    }

    bindAttrNormal() {
        this.gl.useProgram(this.program);
        this.bindAttribute({
            attribute: this.attributes.normal,
            size: 3,
            stride: 3 * Float32Array.BYTES_PER_ELEMENT,
            offfset: 0,
        });
        this.gl.useProgram(null);
    }

    bindAttrTime() {
        this.gl.useProgram(this.program);
        this.bindAttribute({
            attribute: this.attributes.tLocal,
            size: 1,
            stride: 1 * Float32Array.BYTES_PER_ELEMENT,
            offfset: 0,
        });
        this.gl.useProgram(null);
    }

}