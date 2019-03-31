'use strict';

class Graphics {
    constructor(canvas) {
        this.canvas = canvas;
        this.scenes = [];

        //active scene
        this.sceneIndex = 0;
    }

    get scene() {
        return this.scenes[this.sceneIndex];
    }

    get loaded(){
        if (this.scenes.length == 0){
            return false;
        }
        return this.scenes[this.scenes.length - 1].loaded;
    }

    init() {
        console.log('Getting webgl 2 context');
        this.gl = this.canvas.getContext('webgl2');
        var ext = this.gl.getExtension('OES_element_index_uint');

        if (!this.gl) {
            console.error('WebGL 2 not supported');
            throw 'WebGL 2 not supported';
        }

        this.programs = {
            box: new BoxProgram(this.gl),
            glyph: new GlyphProgram(this.gl),
            layer: new LayerProgram(this.gl),
            stream: new StreamProgram(this.gl),
            text: new TextProgram(this.gl),
            colorbar: new ColorbarProgram(this.gl),
        }

        //this.gl.enable(this.gl.DEPTH_TEST);
        //this.gl.disable(this.gl.BLEND);
        //this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        //this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    }

    resize(x, y, offsetx=0, half=false) {
        if (!half){
            this.canvas.width = x;
            this.canvas.height = y;
            this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        } else {
            this.gl.viewport(offsetx, 0, this.gl.canvas.width / 2, this.gl.canvas.height);
        }

        //setup for each of existing scenes
        for (let scene of this.scenes) {
            if (!half){
                scene.screen(this.canvas.width, this.canvas.height);
            } else {
                scene.screen(this.canvas.width / 2, this.canvas.height);
            }
        }
    }

    render() {
        if (this.scene !== null && this.scene !== undefined) {
            this.scene.render(this.programs);
        }
    }

    renderColor(){
        if (this.scene !== null && this.scene !== undefined) {
            this.scene.renderColor();
        }
    }

    renderDepth(){
        if (this.scene !== null && this.scene !== undefined) {
            this.scene.renderDepth();
        }
    }

    addScene(sceneContents, ui) {
        let scene = new Scene(this.gl);
        scene.init(sceneContents, ui, this.programs);
        scene.screen(this.canvas.width, this.canvas.height);
        this.scenes.push(scene);
    }

    displayScene(index) {
        this.sceneIndex = index;
        this.scene.screen(this.canvas.width, this.canvas.height);
    }

    delete(all = false) {
        //Delete all of the scenes...
        for (let scene of this.scenes) {
            scene.delete();
        }

        this.sceneIndex = 0;
        this.scenes = [];

        if (!all)
            return;

        for (let program in this.programs) {
            this.gl.deleteProgram(this.programs[program].program);
        }
    }

    getState() {
        let state = [[], this.sceneIndex];

        for (let s of this.scenes){
            state[0].push(s.getState());
        }

        return state;
    }

    setState(state) {
        for (let i = 0; i < this.scenes.length; ++i){
            this.scenes[i].setState(state[0][i]);
        }
        this.sceneIndex = state[1];
    }


    rotate(dx, dy) {
        if (this.scene) {
            this.scene.camera.rotate(dx, dy);
        }
    }

    moveFront(d) {
        if (this.scene) {
            this.scene.camera.moveFront(d);
        }
    }

    moveBack(d) {
        if (this.scene) {
            this.scene.camera.moveBack(d);
        }
    }
}