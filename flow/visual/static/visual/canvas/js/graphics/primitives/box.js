'use strict';

class Box extends Primitive {
    constructor(gl) {
        super(gl);
        this.unit = new UnitBox(gl);
        this.loaded = false;
    }

    init(postion, dimensions) {
        let matrix = mat4.create();
        matrix = mat4.scale(mat4.create(), matrix, dimensions);
        console.log(matrix);
        matrix = mat4.translate(mat4.create(), matrix, postion);
        this.model = matrix;

        console.log(this.model);
        this.loaded = true;
    }

    render(camera) {
        if (!this.loaded)
            return;

        this.unit.render({
            model: this.model,
            view: camera.view,
            projection: camera.projection,
        });
    }
}