'use strict';

class Scene{
    constructor(gl){
        this.gl = gl;
        this.camera = new Camera();
        this.objects = [];
    }

    init(contents){
        console.log('loading scene elements');
        if ('glyphs' in contents){
            for (let glyphs_group of contents.glyphs){
                let glyphs = new Glyphs(this.gl);
                glyphs.init(glyphs_group);
                console.log(glyphs);
                this.objects.push(glyphs);
            }
        }

        console.log(this.objects);
        let box = new Box(this.gl);
        box.init(vec3.fromValues(-10, -10, 0), vec3.fromValues(20, 20, 20));
        this.objects.push(box); /*

        let stream = new Stream(this.gl);
        stream.segment([0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 0, 0]);*/
    }

    render(){
        for(let obj of this.objects){
            obj.render(this.camera);
        }
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