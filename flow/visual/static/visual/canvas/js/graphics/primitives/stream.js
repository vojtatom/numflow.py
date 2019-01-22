'use strict';

class Stream extends Primitive {
    constructor(gl) {
        super(gl);
    }

    init(data){
        let positions = Primitive.base64tofloat32(data.points);
        let values = Primitive.base64tofloat32(data.values);
        let lengths = Primitive.base64tofloat32(data.lengths, DType.int);
        console.log(positions, values, lengths);
    }

    /*segment(a_pos, a_vec, b_pos, b_vec) {
        let t0 = performance.now();
        let points = this.piece(8, 1000);
        let t1 = performance.now();
        console.log("Call to do something took " + (t1 - t0) + " milliseconds.");
        console.log(points);
    }

    piece(parts, length) {
        let points = [];
        for (let s = 0; s < length + 1; s++) {
            for (let x = 0; x < 2 * Math.PI; x += 2 * Math.PI / parts) {
                points.push([Math.cos(x), Math.sin(x), 0]);
            }
        }

        let elements = [];
        let o = 0;
        for (let s = 0; s < length; s++) {
            for (let n = 0; n < parts; n++) {
                o = s * parts;
                elements.push([o + n, o + parts + n, o + (n + 1) % parts], 
                              [o + (n + 1) % parts, o + n + parts, o + (n + 1) % parts + parts])
            }
        }

        return {
            points: points,
            elements: elements
        };
    }*/

    render(camera){

    }

    delete(){
        
    }
}