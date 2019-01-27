'use strict';

class Scene{
    constructor(gl){
        this.gl = gl;
        this.camera = new Camera();
        this.light = new Light();
        this.objects = [];
    }

    init(contents){
        console.log('loading scene elements');
       /* let box = new Box(this.gl);
        box.init(vec3.fromValues(-10, -10, 0), vec3.fromValues(20, 20, 40));
        this.objects.push(box); */
        
        if ('glyphs' in contents){
            for (let glyphs_group of contents.glyphs){
                let glyphs = new Glyphs(this.gl);
                glyphs.init(glyphs_group);
                console.log(glyphs);
                this.objects.push(glyphs);
            }
        }

        /*if ('streamlines' in contents){
            for (let stream_group of contents.streamlines){
                let streams = new Stream(this.gl);
                streams.init(stream_group);
                console.log(streams);
                this.objects.push(streams);
            }
        }*/
        /*

        let stream = new Stream(this.gl);
        stream.segment([0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 0, 0]);*/
    }

    render(){
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
        
        //bounding boxes...    
        for(let obj of this.objects){
            obj.renderBoundingBox(this.camera, this.light);
        }

        this.gl.disable(this.gl.BLEND);

        for(let obj of this.objects){
            if (!obj.transparent){
                obj.render(this.camera, this.light);
            }
        }

        //this.gl.disable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.BLEND);

        for(let obj of this.objects){
            if (obj.transparent){
                obj.render(this.camera, this.light);
            }
        }

        this.camera.frame();
    }

    set aspect(a) {
        this.camera.aspect = a;
    }

    delete() {
        console.log('deleting scene...');
        for (let obj of this.objects){
            obj.delete();
        }
    }
}