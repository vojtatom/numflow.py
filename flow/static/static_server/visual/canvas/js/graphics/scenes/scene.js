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


        this.animationCalls = [];
        
        this.time = {
            bounds: {
                low: 0,
                high: 0,
            },
            current: 0,
            delta: 1000,
            step: 100,
            running: false,
            paused: false,
        };

        this.loaded = false;
    }

    init(contents, ui, programs){
        //console.log('loading scene elements');
        let sceneui = new SceneUI();
        
        contents.stats.points.center = Primitive.base64totype(contents.stats.points.center);
        contents.stats.points.min = Primitive.base64totype(contents.stats.points.min);
        contents.stats.points.max = Primitive.base64totype(contents.stats.points.max);
        //console.log(contents.stats);
        
        this.camera.sceneSetup(contents.stats.points);
        
        
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
                this.addAnimatedObject(streams.animationSetup());
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
        
        this.createUI(ui, sceneui);
        this.loaded = true;
    }

    addAnimatedObject(options){
        this.animationCalls.push(options.callback);

        this.time.bounds.low = Math.min(this.time.bounds.low, options.start);
        this.time.bounds.high = Math.max(this.time.bounds.high, options.end);

        this.time.current = this.time.bounds.low;
        this.time.step = (this.time.bounds.high - this.time.bounds.low) / 400;
        this.time.delta = (this.time.bounds.high - this.time.bounds.low) / 20;
        console.log(options);
    }

    togglePauseAnimation(){
        this.time.paused = !this.time.paused;
    }

    toggleAnimation(){
        if (!this.time.running){
            this.time.running = true;
            this.time.current = this.time.bounds.low;
            this.time.paused = false;
        } else {
            for (let callId in this.animationCalls){
                this.animationCalls[callId].reset();
            }
            this.time.running = false;
        }
    }

    timeTick(){
        if (!this.time.running || this.time.paused)
            return;

        let lower = this.time.current - this.time.bounds.low;
        let delta = Math.min(lower, this.time.delta)
        let end = this.time.current;
        let start = Math.max(end - delta, this.time.bounds.low);

        for (let callId in this.animationCalls){
            this.animationCalls[callId].setup(start, end);
        }

        this.time.current = (this.time.current + this.time.step)
        if (this.time.current > this.time.bounds.high)
            this.time.current = this.time.bounds.low;

        this.animationUI.update('current', this.time.current.toFixed(3));
    }

    render(programs){
        //update camera
        this.camera.frame();
        this.timeTick();

        if (!this.camera.needsRender && (!this.time.running || this.time.paused))
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

        this.gl.clearColor(0, 0, 0, 1.0);
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

        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);      
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

    createUI(ui, sceneui){
        let components = [];
        if (this.time.bounds.low != this.time.bounds.high){
            this.animationUI = new ComponentUI({
                title: 'Animation',
                key: 66,
                actions: {
                    activate : () => { this.toggleAnimation(); },
                    deactivate : () => { this.toggleAnimation(); },
                    32: () => this.togglePauseAnimation(),
                },
                main: [{
                  type: 'display',
                  title: 'current',
                  value: this.time.current,
                  id: 'current',
                }],
                side: [{
                    type: 'display',
                    title: 'range',
                    value: this.time.bounds.low + ' - ' + this.time.bounds.high,
                },{
                    type: 'slider',
                    title: 'render range',
                    value: this.time.delta,
                    min: this.time.bounds.low,
                    max: this.time.bounds.high,
                    update: (delta) => { this.time.delta = delta },
                },{
                    type: 'slider',
                    title: 'time step',
                    value: this.time.step,
                    min: 1,
                    max: (this.time.bounds.high - this.time.bounds.low) / 5,
                    update: (step) => { this.time.step = step },
                }],
                help: BaseUI.getHelpElement([{
                    action: 'play/pause',
                    keys: 'spacebar',
                }], true)
            });

            components.push(this.animationUI);
        }

        ui.addScene(sceneui, components);
    }

    getState(){
        let state = {
            objects: [],
            camera: null,
            time: this.time,
        };

        for(let type in this.objects){  
            for(let obj of this.objects[type].obj){
                state.objects.push(obj.getState());
            }
        }

        state.camera = this.camera.getState();
        return state;
    }

    setState(state){
        let i = 0;
        for(let type in this.objects){  
            for(let obj of this.objects[type].obj){
                obj.setState(state.objects[i++]);
            }
        }
        
        this.camera.setState(state.camera);
        this.time = state.time;
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