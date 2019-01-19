'use strict';

class Scene{
    constructor(gl){
        this.gl = gl;
        this.camera = new Camera();
        this.objects = [];
    }

    init(){
        let box = new Box(this.gl);
        box.init(vec3.fromValues(0, 0, 0), vec3.fromValues(2, 3, 5));
        this.objects.push(box); 

        let stream = new Stream(this.gl);
        stream.segment([0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 0, 0]);
    }

    render(){
        for(let obj of this.objects){
            obj.render(this.camera);
        }
    }

    set aspect(a) {
        this.camera.aspect = a;
    }
}