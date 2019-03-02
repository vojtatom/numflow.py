'use strict';

class MethodPrimitive extends Primitive {
    //META INFO MANAGEMENT
	metaFromData(meta, stats){
        super.metaFromData(meta, stats);
        this.meta = Object.assign({}, this.meta, {
            colorMapSize: meta.colormap.sampling,
            colorMap0: vec4.fromValues(...meta.colormap.colors[0]),
            colorMap1: vec4.fromValues(...meta.colormap.colors[1]),
            colorMap2: vec4.fromValues(...meta.colormap.colors[2]),
            colorMap3: vec4.fromValues(...meta.colormap.colors[3]),
            colorMap4: vec4.fromValues(...meta.colormap.colors[4]),

            appearance: Appearance.encode(meta.appearance),
            brightness: 1.0,
            
            visible: true,
            boxVisible: true,
            lablesVisible: true,

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

    updateEdgeAxis(camera){
        this.box.updateEdgeAxis(camera);
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
            }
        }
    }
}