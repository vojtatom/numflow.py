'use strict';

class Box extends UnitBox {
    constructor(gl) {
        super(gl);
    }

    init(data = null) {
        //Belated initialization...
        if (!this.isInitReady(data))
            return;
        data = this.lateLoadData(data);
        super.init(data);

        let start = Primitive.base64totype(data.meta.bounds.start);
        let dim = Primitive.base64totype(data.meta.bounds.dim);

        let matrix = mat4.create();
        matrix = mat4.translate(mat4.create(), matrix, start);
        matrix = mat4.scale(mat4.create(), matrix, dim);
        this.model = matrix;
        this.loaded = true;
    }

    render(camera, light) {
        if(!this.isRenderReady)
            return;

        super.render({
            model: this.model,
            view: camera.view,
            projection: camera.projection,
        });
    }

    delete() {
        
    }
}