'use strict';

class Box extends UnitBox {
    constructor(gl, programs) {
        super(gl, programs);
        this.labels = [];
        this.loaded = false;

        this.programs = programs;
        this.activeEdge = {
            0: 0,
            1: 0,
            2: 0,
        };
    }

    init(data = null) {
        //Belated initialization...
        if (!this.isInitReady(data))
            return;
        data = this.lateLoadData(data);
        super.init(data);

        let start = Primitive.base64totype(data.meta.bounds.start);
        let dim = Primitive.base64totype(data.meta.bounds.dim);

        //meta to be used later
        this.meta = {
            start: start,
            dim: dim,
        }

        //model matrix
        let matrix = mat4.create();
        matrix = mat4.translate(mat4.create(), matrix, start);
        matrix = mat4.scale(mat4.create(), matrix, dim);
        this.model = matrix;

        // active edges
        let x = [ vec3.create(), vec3.create(), vec3.create(), vec3.create() ];
        let y = [ vec3.create(), vec3.create(), vec3.create(), vec3.create() ];
        let z = [ vec3.create(), vec3.create(), vec3.create(), vec3.create() ];

        //half of the dimensions
        let halves = vec3.scale(vec3.create(), dim, 0.5);

        for (let i in x){
            x[i][0] = halves[0];
            x[i][1] = i % 2             ? start[1] : start[1] + dim[1]; 
            x[i][2] = Math.floor(i / 2) ? start[2] : start[2] + dim[2]; 
        }

        for (let i in y){
            y[i][0] = i % 2             ? start[0] : start[0] + dim[0]; 
            y[i][1] = halves[1];
            y[i][2] = Math.floor(i / 2) ? start[2] : start[2] + dim[2]; 
        }

        for (let i in z){
            z[i][0] = i % 2             ? start[0] : start[0] + dim[0]; 
            z[i][1] = Math.floor(i / 2) ? start[1] : start[1] + dim[1]; 
            z[i][2] = halves[2];
        }

        this.edgeCenters = {
            0: x,
            1: y,
            2: z,
        };

        //center
        this.meta['center'] = vec3.add(vec3.create(), start, halves);

        //add labels

        let samples = [];
        for (let i = 0; i < 3; ++i){
            samples.push(Math.max(3, Math.min(30, Math.floor(dim[i] / 20) * 5)));
        }

        this.addLabels(...samples);
        this.loaded = true;
    }

    addLabels(x, y, z){
        let sampling = [x, y, z];
        let max, add;


        for (let a in sampling){
            max = this.meta.start[a] + this.meta.dim[a];
            add = this.meta.dim[a] / sampling[a]
            if (add == 0){
                this.addLabel(a, this.meta.start[a]);
            } else {
                for (let i = this.meta.start[a]; i <= max; i = i + add){
                    this.addLabel(a, i);
                }
            }
        }

    }

    addLabel(axis, value){
        let start = this.meta.start;
        let dim = this.meta.dim;
        let shift = vec3.create();

        for (let i  = 0; i < 4; ++i){
            let position = vec3.create();
            if (axis == 0){
                position[0] = value;
                position[1] = i % 2             ? start[1] : start[1] + dim[1]; 
                position[2] = Math.floor(i / 2) ? start[2] : start[2] + dim[2]; 
            } else if (axis == 1){
                position[0] = i % 2             ? start[0] : start[0] + dim[0]; 
                position[1] = value;
                position[2] = Math.floor(i / 2) ? start[2] : start[2] + dim[2]; 
            } else if (axis == 2){
                position[0] = i % 2             ? start[0] : start[0] + dim[0]; 
                position[1] = Math.floor(i / 2) ? start[1] : start[1] + dim[1]; 
                position[2] = value;
            }

            vec3.subtract(shift, position, this.meta.center);
            shift[axis] = 0;
            vec3.scaleAndAdd(position, position, shift, 1 / vec3.len(shift)); 

            let quad = new Quad(this.gl, this.programs);
            quad.init({
                position: position,
                value: value,
            });

            quad.boxMeta = {
                axis: axis,
                edge: i,
            };
            this.labels.push(quad);

        }
    }

    updateEdgeAxis(camera){
        let camPosition = camera.position;
        let distClosest, distSecond;
        let closest, second;
        let tmpDist;

        for (let ax in this.edgeCenters){
            distClosest = Infinity;
            distSecond = Infinity;
            for (let edge in this.edgeCenters[ax]){
                //calc distance between you and center of the edge
                tmpDist = vec3.dist(this.edgeCenters[ax][edge], camPosition);
                //when the edge is the closest yet
                if (tmpDist < distClosest) {
                    second = closest;
                    distSecond = distClosest;
                    closest = edge;
                    distClosest = tmpDist;

                //when the edge is the second closest
                } else if (tmpDist < distSecond){
                    second = edge;
                    distSecond = tmpDist;
                }
            }

            this.activeEdge[ax] = parseInt(second);
        }

        //console.log(this.activeEdge);
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

    renderFilled(camera, light) {
        if(!this.isRenderReady)
            return;

        super.renderFilled({
            model: this.model,
            view: camera.view,
            projection: camera.projection,
        });
    }

    renderLabels(camera, light){
        for (let l of this.labels){

            if (this.activeEdge[l.boxMeta.axis] !== l.boxMeta.edge)
                continue;

            l.render(camera, light);
        }
    }

    delete() {
        super.delete();
        for (let label of this.labels){
            label.delete();
        }
    }
}