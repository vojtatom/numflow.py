'use strict';

class MethodPrimitive extends Primitive {
    //META INFO MANAGEMENT
	metaFromData(meta, stats){
        super.metaFromData(meta, stats);
        console.log(stats);
        this.meta = Object.assign({}, this.meta, {
            colorMapSize: meta.colormap.sampling,
            colorMap0: vec4.fromValues(...meta.colormap.colors[0]),
            colorMap1: vec4.fromValues(...meta.colormap.colors[1]),
            colorMap2: vec4.fromValues(...meta.colormap.colors[2]),
            colorMap3: vec4.fromValues(...meta.colormap.colors[3]),
            colorMap4: vec4.fromValues(...meta.colormap.colors[4]),

            appearance: Appearance.encode(meta.appearance),
            brightness: 1.0,

            //save only values
            stats: stats.values,

            scaleFactor: stats.points.scale_factor,
            shift: stats.points.center,
        });
    }
    
    uniformDict(camera, light, statsMode = 'xyz'){
        let unifs = super.uniformDict(camera, light);
		return Object.assign({}, unifs, this.meta.stats[statsMode]);
	}
}