'use strict';

class Graphics {
    constructor(canvas) {
        this.canvas = canvas;
        this.scenes = [];

        //active scene
        this.scene = null;
    }

    get loaded(){
        return this.scene !== null;
    }

    init() {
        console.log('Getting webgl 2 context');
        this.gl = this.canvas.getContext('webgl2');

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

    resize(x, y) {
        this.canvas.width = x;
        this.canvas.height = y;

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        //setup for each of existing scenes
        for (let scene of this.scenes) {
            scene.screen(this.canvas.width, this.canvas.height);
        }
    }

    render() {
        if (this.scene !== null) {
            this.scene.render(this.programs);
        }
    }

    renderColor(){
        if (this.scene !== null) {
            this.scene.renderColor();
        }
    }

    renderDepth(){
        if (this.scene !== null) {
            this.scene.renderDepth();
        }
    }

    addScene(sceneContents, ui) {
        let scene = new Scene(this.gl);
        scene.init(sceneContents, ui, this.programs);
        this.scenes.push(scene);

        if (this.scene === null) {
            this.scene = scene;
            scene.screen(this.canvas.width, this.canvas.height);
        }
    }

    displayScene(index) {
        //console.log('scene', index);
        this.scene = this.scenes[index];
        this.scene.screen(this.canvas.width, this.canvas.height);
    }

    delete(all = false) {
        //Delete all of the scenes...
        for (let scene of this.scenes) {
            scene.delete();
        }

        this.scene = null
        this.scenes = [];

        if (!all)
            return;

        for (let program in this.programs) {
            this.gl.deleteProgram(this.programs[program].program);
        }
    }

    getState() {
        if (this.loaded)
            return this.scene.getState();
    }

    setState(state) {
        if (this.loaded)
            this.scene.setState(state);
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