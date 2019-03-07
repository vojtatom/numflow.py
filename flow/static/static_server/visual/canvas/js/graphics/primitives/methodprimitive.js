'use strict';

class MethodPrimitive extends Primitive {

    constructor(gl, programs){
        super(gl);
        this.box = new Box(gl, programs);
        this.colorbar = new Colorbar(gl, programs);
    }

    //META INFO MANAGEMENT
	metaFromData(meta, stats){
        super.metaFromData(meta, stats);
        this.meta = Object.assign({}, this.meta, {
            colorMapSize: meta.colormap.sampling,
            colorMap0: meta.colormap.colors[0],
            colorMap1: meta.colormap.colors[1],
            colorMap2: meta.colormap.colors[2],
            colorMap3: meta.colormap.colors[3],
            colorMap4: meta.colormap.colors[4],

            appearance: Appearance.encode(meta.appearance),
            brightness: 1.0,
            
            visible: true,
            boxVisible: true,
            lablesVisible: true,
            colorBarVisible: false,

            //save only values
            stats: stats.values,

            scaleFactor: stats.points.scale_factor,
            shift: stats.points.center,
        });
    }
    
    uniformDict(camera, light, statsMode = CoordMode.xyz){
        let unifs = super.uniformDict(camera, light);
		return Object.assign({}, unifs, this.meta.stats[CoordMode.decode(statsMode)]);
    }

    initBoundingBox(data){
		this.box.init(data);
	}

    initColorbar(data){
        this.colorbar.init(data);
    }

    renderColorbar(camera, light){
        if (!this.meta.colorBarVisible)
            return;
            
        this.colorbar.render(camera, light, this.meta.mode);
    }
    
    renderBox(camera, light){
        if (!this.meta.visible || !this.meta.boxVisible)
            return;


        this.box.render(camera, light);
    }

    renderDepth(camera, light){
		let appearanceSetting = this.meta.appearance;
        this.meta.appearance = Appearance.depth;
        this.render(camera, light);
        this.meta.appearance = appearanceSetting;
	}

    renderLabels(camera, light){
        if (!this.meta.visible || !this.meta.boxVisible || !this.meta.lablesVisible)
            return;

        this.box.renderLabels(camera, light);
    }

    renderColorbarLabels(camera, light){
        if (!this.meta.colorBarVisible)
            return;

        this.colorbar.renderLabels(camera, light, this.meta.mode);
    }

    updateEdgeAxis(camera){
        this.box.updateEdgeAxis(camera);
    }

    getState(){
        return this.meta;
    }

    setState(state){
        this.stateToBeSet = state;
        return this.meta;
    }

    get ui(){
        return {
            mode: {
                type: 'select',
                options: ['xyz', 'x', 'y', 'z'],
                callbacks: [
                    () => {this.meta.mode = CoordMode.xyz}, 
                    () => {this.meta.mode = CoordMode.x},
                    () => {this.meta.mode = CoordMode.y},
                    () => {this.meta.mode = CoordMode.z},
                ],
                value: 'xyz',
            },
            brightness: {
                type: 'slider',
                min: 0,
                max: 2,
                delta:  0.01,
                value: 1,
                callback: (value) => { this.meta.brightness = value },
            },
            visibility: {
                type: 'select',
                options: ['show', 'hide'],
                callbacks: [
                    () => {this.meta.visible = true}, 
                    () => {this.meta.visible = false},
                ],
                value: 'show',
            },
            box: {
                type: 'select',
                options: ['show', 'hide'],
                callbacks: [
                    () => {this.meta.boxVisible = true}, 
                    () => {this.meta.boxVisible = false},
                ],
                value: 'show',
            },
            lables: {
                type: 'select',
                options: ['show', 'hide'],
                callbacks: [
                    () => {this.meta.lablesVisible = true}, 
                    () => {this.meta.lablesVisible = false},
                ],
                value: 'show',
            },
            activate: {
                type: 'call',
                call: () => { this.meta.colorBarVisible = true; },
            },
            deactivate: {
                type: 'call',
                call: () => { this.meta.colorBarVisible = false; },
            },
        }
    }
}