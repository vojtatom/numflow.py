'use strict';

/**
 * Main graphics class of the application.
 */
class Graphics {
    /**
     * Create a new instance of the graphics class.
     * @param {HTML element} canvas canvas element
     */
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

    /**
     * Initialize the graphics class, acquire the WebGL 2 context,
     * load shaders and compile programs.
     */
    init() {
        console.log('Getting webgl 2 context');
        this.gl = this.canvas.getContext('webgl2');
        
        if (!this.gl) {
            console.error('WebGL 2 not supported, please use a different browser.');
            throw 'WebGL 2 not supported, please use a different browser.';
        }

        var ext = this.gl.getExtension('OES_element_index_uint');
        
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

    /**
     * Resize the canvas.
     * 
     * @param {int} x x dimension of the screen
     * @param {int} y y dimension of the screen
     * @param {int} offsetx x offset of the rendered section
     * @param {bool} half true if the rendering is performed only in one half of the canvas
     */
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

    /**
     * Render a single frame.
     */
    render() {
        if (this.scene !== null && this.scene !== undefined) {
            this.scene.render(this.programs);
        }
    }

    /**
     * Render a single color frame.
     */
    renderColor(){
        if (this.scene !== null && this.scene !== undefined) {
            this.scene.renderColor();
        }
    }

    /**
     * Render a single depth frame.
     */
    renderDepth(){
        if (this.scene !== null && this.scene !== undefined) {
            this.scene.renderDepth();
        }
    }

    /**
     * Initialize geometry of a new scene.
     * 
     * @param {object} sceneContents contents of the scene
     * @param {FlowAppUI} ui main app UI
     */
    addScene(sceneContents, ui) {
        let scene = new Scene(this.gl);
        scene.init(sceneContents, ui, this.programs);
        scene.screen(this.canvas.width, this.canvas.height);
        this.scenes.push(scene);
    }

    /**
     * Switch graphics context to render selected scene.
     * 
     * @param {int} index index of target scene
     */
    displayScene(index) {
        this.sceneIndex = index;
        this.scene.screen(this.canvas.width, this.canvas.height);
    }

    /**
     * Delete contents of the graphics class.
     * @param {bool} all true if programs should also be deleted
     */
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

    /**
     * Get current state of the graphics context.
     */
    getState() {
        let state = [[], this.sceneIndex];

        for (let s of this.scenes){
            state[0].push(s.getState());
        }

        return state;
    }

    /**
     * Set object's state.
     * @param {object} state state object
     */
    setState(state) {
        for (let i = 0; i < this.scenes.length; ++i){
            this.scenes[i].setState(state[0][i]);
        }
        this.sceneIndex = state[1];
    }

    /**
     * Rotates the view of the camera.
     * 
     * @param {int} dx mouse movement delta along x axis
     * @param {int} dy mouse movement delta along y axis
     */
    rotate(dx, dy) {
        if (this.scene) {
            this.scene.camera.rotate(dx, dy);
        }
    }

    /**
     * Move the camera to the front.
     * @param {float} d speed of the movement
     */
    moveFront(d) {
        if (this.scene) {
            this.scene.camera.moveFront(d);
        }
    }

    /**
     * Move the camera to the back.
     * @param {float} d speed of the movement
     */
    moveBack(d) {
        if (this.scene) {
            this.scene.camera.moveBack(d);
        }
    }
}