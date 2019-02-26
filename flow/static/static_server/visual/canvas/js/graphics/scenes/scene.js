'use strict';

class Scene{
    constructor(gl){
        this.gl = gl;
        this.camera = new Camera();
        this.light = new Light();
        this.objects = [];
    }

    init(contents, ui, programs){
        console.log('loading scene elements');
        let sceneui = new SceneUI();

        contents.stats.points.center = Primitive.base64totype(contents.stats.points.center);
        contents.stats.points.min = Primitive.base64totype(contents.stats.points.min);
        contents.stats.points.max = Primitive.base64totype(contents.stats.points.max);
        console.log(contents.stats);


       /* let box = new Box(this.gl);
        box.init(vec3.fromValues(-10, -10, 0), vec3.fromValues(20, 20, 40));
        this.objects.push(box); */
        
        if ('glyphs' in contents){
            for (let glyphs_group of contents.glyphs){
                let glyphs = new Glyphs(this.gl, programs);
                glyphs_group.stats = contents.stats;
                glyphs.init(glyphs_group);
                //console.log(glyphs);
                this.objects.push(glyphs);

                sceneui.addWidget(new WidgetUI(glyphs.ui));
            }
        }

        if ('streamlines' in contents){
            for (let stream_group of contents.streamlines){
                let streams = new Stream(this.gl, programs);
                stream_group.stats = contents.stats;
                streams.init(stream_group);
                //console.log(streams);
                this.objects.push(streams);

                sceneui.addWidget(new WidgetUI(streams.ui));
            }
        }

        if ('layer' in contents){
            for (let layer_group of contents.layer){
                let layer = new Layer(this.gl, programs);
                layer_group.stats = contents.stats;
                layer.init(layer_group);
                //console.log(streams);
                this.objects.push(layer);

                sceneui.addWidget(new WidgetUI(layer.ui));
            }
        }
        /*

        let stream = new Stream(this.gl);
        stream.segment([0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 0, 0]);*/

        //append ui
        ui.addScene(sceneui);
    }

    render(){
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
            
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
        
        //draw bounding boxes   
        for(let obj of this.objects){
            obj.renderBox(this.camera, this.light);
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
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
        for(let obj of this.objects){
            if (obj.transparent){
                obj.render(this.camera, this.light);
            }
        }
        
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.disable(this.gl.DEPTH_TEST);
        
        //bounding boxes labels  
        for(let obj of this.objects){
            obj.renderLabels(this.camera, this.light);
        }

        //update camera
        this.camera.frame();

        //check for camera movement
        if (this.camera.isMoving){
            for(let obj of this.objects){
                obj.updateEdgeAxis(this.camera);
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