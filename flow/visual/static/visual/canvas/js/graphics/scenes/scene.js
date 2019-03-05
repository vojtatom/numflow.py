'use strict';

class Scene{
    constructor(gl){
        this.gl = gl;
        this.camera = new Camera();
        this.light = new Light();
        this.objects = {
            glyph : {
                obj: [],
                program: null,
            },
            stream: {
                obj: [],
                program: null,
            },
            layer: {
                obj: [],
                program: null,
            },
        };
    }

    init(contents, ui, programs){
        //console.log('loading scene elements');
        let sceneui = new SceneUI();

        contents.stats.points.center = Primitive.base64totype(contents.stats.points.center);
        contents.stats.points.min = Primitive.base64totype(contents.stats.points.min);
        contents.stats.points.max = Primitive.base64totype(contents.stats.points.max);
        //console.log(contents.stats);


       /* let box = new Box(this.gl);
        box.init(vec3.fromValues(-10, -10, 0), vec3.fromValues(20, 20, 40));
        this.objects.push(box); */
        
        if ('glyphs' in contents){
            for (let glyphs_group of contents.glyphs){
                let glyphs = new Glyphs(this.gl, programs);
                glyphs_group.stats = contents.stats;
                glyphs.init(glyphs_group);
                //console.log(glyphs);
                this.objects.glyph.obj.push(glyphs);

                sceneui.addWidget(new WidgetUI(glyphs.ui));
            }
        }

        this.objects.glyph.program = programs.glyph;

        if ('streamlines' in contents){
            for (let stream_group of contents.streamlines){
                let streams = new Stream(this.gl, programs);
                stream_group.stats = contents.stats;
                streams.init(stream_group);
                //console.log(streams);
                this.objects.stream.obj.push(streams);

                sceneui.addWidget(new WidgetUI(streams.ui));
            }
        }

        this.objects.stream.program = programs.stream;

        if ('layer' in contents){
            for (let layer_group of contents.layer){
                let layer = new Layer(this.gl, programs);
                layer_group.stats = contents.stats;
                layer.init(layer_group);
                //console.log(streams);
                this.objects.layer.obj.push(layer);

                sceneui.addWidget(new WidgetUI(layer.ui));
            }
        }

        this.objects.layer.program = programs.layer;
        /*

        let stream = new Stream(this.gl);
        stream.segment([0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 0, 0]);*/

        //append ui
        ui.addScene(sceneui);
    }

    render(programs){
        //update camera
        this.camera.frame();

        if (!this.camera.needsRender)
            return;

        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
            
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
        
        //draw bounding boxes   
        programs.box.bind();
        for(let type in this.objects){
            for(let obj of this.objects[type].obj){
                obj.renderBox(this.camera, this.light);
            }
        }
        
        //draw solid objects
        this.gl.disable(this.gl.BLEND);
        for(let type in this.objects){
            this.objects[type].program.bind();   
            for(let obj of this.objects[type].obj){
                if (!obj.transparent){
                    obj.render(this.camera, this.light);
                }
            }
        }
        
        //draw transparent objects
        this.gl.enable(this.gl.BLEND);
        for(let type in this.objects){
            this.objects[type].program.bind();   
            for(let obj of this.objects[type].obj){
                if (obj.transparent){
                    obj.render(this.camera, this.light);
                }
            }
        }
        
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.BLEND);
        //colorbars
        programs.colorbar.bind();
        for(let type in this.objects){  
            for(let obj of this.objects[type].obj){
                obj.renderColorbar(this.camera, this.light);
                
                //check for camera movement
                if (this.camera.isMoving){
                    obj.updateEdgeAxis(this.camera);
                }
            }
        }
        
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
        //bounding boxes labels  
        programs.text.bind();
        for(let type in this.objects){  
            for(let obj of this.objects[type].obj){
                obj.renderLabels(this.camera, this.light);
                obj.renderColorbarLabels(this.camera, this.light);
            }
        }
    }

    renderColor(){
        //update camera
        this.camera.frame();

        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
            
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
        this.gl.disable(this.gl.BLEND);

        //draw solid objects
        for(let type in this.objects){
            this.objects[type].program.bind();   
            for(let obj of this.objects[type].obj){
                if (!obj.transparent){
                    obj.render(this.camera, this.light);
                }
            }
        }
        
        //draw transparent objects
        this.gl.enable(this.gl.BLEND);
        for(let type in this.objects){
            this.objects[type].program.bind();   
            for(let obj of this.objects[type].obj){
                if (obj.transparent){
                    obj.render(this.camera, this.light);
                }
            }
        }
    }

    renderDepth(){
        //update camera
        this.camera.frame();

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);      
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.BLEND);
        
        //draw depth  
        for(let type in this.objects){
            this.objects[type].program.bind();   
            for(let obj of this.objects[type].obj){
                obj.renderDepth(this.camera, this.light);
            }
        }
    }

    getState(){
        return this.camera.getState();
    }

    setState(state){
        this.camera.setState(state);
    }

    screen(x, y) {
        this.camera.screen(x, y);
    }

    delete() {
        //console.log('deleting scene...');
        for(let type in this.objects){  
            for(let obj of this.objects[type].obj){
                obj.delete();
            }
        }
    }
}