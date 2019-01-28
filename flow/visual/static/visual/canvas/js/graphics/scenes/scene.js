'use strict';

class Scene{
    constructor(gl){
        this.gl = gl;
        this.camera = new Camera();
        this.light = new Light();
        this.objects = [];
        this.boxes = [];
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
                //console.log(glyphs);
                this.objects.push(glyphs);
                this.boxes.push(glyphs.box);
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

    static restoreBlend(gl){
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    }

    render(){
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
        
        //draw bounding boxes   
        for(let box of this.boxes){
            box.render(this.camera, this.light);
        }

        //draw solid objects
        this.gl.disable(this.gl.BLEND);
        for(let obj of this.objects){
            if (!obj.transparent){
                obj.render(this.camera, this.light);
            }
        }

        //draw transparent objects
		this.gl.enable(this.gl.BLEND);
        for(let obj of this.objects){
            if (obj.transparent){
                obj.render(this.camera, this.light);
            }
        }

        //this.gl.disable(this.gl.BLEND);


        /*this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);*/
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);

        /*//bounding boxes labels...    
        for(let box of this.boxes){
            box.renderFilled(this.camera, this.light);
            box.renderLabels(this.camera, this.light);
        }*/

        //bounding boxes labels  
        for(let box of this.boxes){
            box.renderLabels(this.camera, this.light);
        }

        //update camera
        this.camera.frame(this);

        //check for camera movement
        if (this.camera.isMoving){
            for(let box of this.boxes){
                box.updateEdgeAxis(this.camera);
            }
            console.log('camera is moving');
        }
    }

    screen(x, y) {
        this.camera.screen(x, y);
    }

    delete() {
        console.log('deleting scene...');
        for (let obj of this.objects){
            obj.delete();
        }
    }
}