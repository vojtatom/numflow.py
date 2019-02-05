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
        let sceneui = new SceneUI();

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

                sceneui.addWidget(new WidgetUI(glyphs.ui));
            }
        }

        if ('streamlines' in contents){
            for (let stream_group of contents.streamlines){
                let streams = new Stream(this.gl);
                streams.init(stream_group);
                //console.log(streams);
                this.objects.push(streams);
                this.boxes.push(streams.box);

                sceneui.addWidget(new WidgetUI(streams.ui));
            }
        }

        if ('layer' in contents){
            for (let layer_group of contents.layer){
                let layer = new Layer(this.gl);
                layer.init(layer_group);
                //console.log(streams);
                this.objects.push(layer);
                this.boxes.push(layer.box);

                sceneui.addWidget(new WidgetUI(layer.ui));
            }
        }
        /*

        let stream = new Stream(this.gl);
        stream.segment([0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 0, 0]);*/

        //append ui
        FlowAppUI.addScene(sceneui);
    }

    render(){
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
            
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
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        for(let obj of this.objects){
            if (obj.transparent){
                obj.render(this.camera, this.light);
            }
        }

        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);

        //bounding boxes labels  
        for(let box of this.boxes){
            box.renderLabels(this.camera, this.light);
        }

        //update camera
        this.camera.frame();

        //check for camera movement
        if (this.camera.isMoving){
            for(let box of this.boxes){
                box.updateEdgeAxis(this.camera);
            }
            //console.log('camera is moving');
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