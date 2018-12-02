'use strict';

class BoxProgram extends Program {
    constructor(gl) {
        if(!BoxProgram.instance){
            super(gl);
            DataManager.files({
                files: [
                    Shader.dir + 'box_vs.glsl',
                    Shader.dir + 'box_fs.glsl',
                ],
                success: (f) => {
                        this.init(...f)
                        this.setup();
                    },
                fail: (r) => { console.error(r); },
                });

                BoxProgram.instance = this;
        }

        return BoxProgram.instance;
    }

    setup(){
        this.getAttributes({
            position: 'vertPosition',
        });

        this.getUniforms({
            model: 'mWorld',
			view: 'mView',
			proj: 'mProj',
        });

        console.log(this.attributes);
        console.log(this.uniforms);
    }
}