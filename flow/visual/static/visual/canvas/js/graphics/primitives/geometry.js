'use strict';

class Geometry{
    static glyphVertCone(sampling = 10){
        let vert = [];
        let add = 2 * Math.PI / sampling;
        let size = 0.5;

        for (let i = 0; i < 2 * Math.PI; i += add){
            vert.push(0, size * Math.cos(i), size * Math.sin(i));
            vert.push(0, size * Math.cos(i + add), size * Math.sin(i + add));
            vert.push(size * 2, 0, 0);
        }

        for (let i = 0; i < 2 * Math.PI; i += add){
            vert.push(0, size * Math.cos(i), size * Math.sin(i));
            vert.push(0, size * Math.cos(i + add), size * Math.sin(i + add));
            vert.push(0, 0, 0);
        }

        return vert;
    }

    static glyphNormCone(sampling = 10){
        let vert = [];
        let add = 2 * Math.PI / sampling;
        let a, b;
        let x = vec3.create();
        let y = vec3.create();
        let c = vec3.create();
        let t = vec3.fromValues(2, 0, 0);

        for (let i = 0; i < 2 * Math.PI; i += add){
            a = vec3.fromValues(0, Math.cos(i), Math.sin(i));
            b = vec3.fromValues(0, Math.cos(i + add), Math.sin(i + add));
            vec3.sub(x, a, t);
            vec3.sub(y, b, t);
            vec3.cross(c, x, y);

            for (let k = 0; k < 3; k++){
                vert.push(c[0], c[1], c[2]);
            }
        }

        for (let i = 0; i < 2 * Math.PI; i += add){
            for (let k = 0; k < 3; k++){
                vert.push(-1, 0, 0);
            }
        }

        return vert;
    }

    static glyphVertLine(sampling, height = 4){
        let vert = [];
        let add = 2 * Math.PI / sampling;
        let size = 0.5;

        for (let i = 0; i < 2 * Math.PI; i += add){
            vert.push(0, size * Math.cos(i), size * Math.sin(i));
            vert.push(0, size * Math.cos(i + add), size * Math.sin(i + add));
            vert.push(size * height, size * Math.cos(i), size * Math.sin(i));

            vert.push(0, size * Math.cos(i + add), size * Math.sin(i + add));
            vert.push(size * height, size * Math.cos(i + add), size * Math.sin(i + add));
            vert.push(size * height, size * Math.cos(i), size * Math.sin(i));
        }

        for (let i = 0; i < 2 * Math.PI; i += add){
            vert.push(0, size * Math.cos(i), size * Math.sin(i));
            vert.push(0, size * Math.cos(i + add), size * Math.sin(i + add));
            vert.push(0, 0, 0);
        }

        for (let i = 0; i < 2 * Math.PI; i += add){
            vert.push(size * height, size * Math.cos(i + add), size * Math.sin(i + add));
            vert.push(size * height, size * Math.cos(i), size * Math.sin(i));
            vert.push(size * height, 0, 0);
        }

        return vert;
    }

    static glyphNormLine(sampling, height = 4){
        let vert = [];
        let add = 2 * Math.PI / sampling;
        let a, b;
        let x = vec3.create();
        let y = vec3.create();
        let c = vec3.create();
        let t = vec3.create();

        for (let i = 0; i < 2 * Math.PI; i += add){
            a = vec3.fromValues(0, Math.cos(i), Math.sin(i));
            b = vec3.fromValues(0, Math.cos(i + add), Math.sin(i + add));
            t = vec3.fromValues(height, Math.cos(i), Math.sin(i));
            vec3.sub(x, a, t);
            vec3.sub(y, b, t);
            vec3.cross(c, x, y);

            for (let k = 0; k < 6; k++){
                vert.push(c[0], c[1], c[2]);
            }
        }

        for (let i = 0; i < 2 * Math.PI; i += add){
            for (let k = 0; k < 3; k++){
                vert.push(-1, 0, 0);
            }
        }

        for (let i = 0; i < 2 * Math.PI; i += add){
            for (let k = 0; k < 3; k++){
                vert.push(1, 0, 0);
            }
        }

        return vert;
    }


    static streamVert(sampling, divisions = 10){
        let vert = [];

        for (let i = 0; i < divisions; ++i){
            vert = vert.concat(Geometry.glyphVertLine(sampling, 0));
        }

        return vert;
    } 


    static streamNorm(sampling, divisions = 10){
        let vert = [];

        for (let i = 0; i < divisions; ++i){
            vert = vert.concat(Geometry.glyphNormLine(sampling, 1));
        }

        return vert;
    }


    static streamLocalT(sampling, divisions = 10){
        let vert = [];
        let add = 2 * Math.PI / sampling;

        for (let i = 0; i < divisions; ++i){
            let base = i / divisions;
            let top = (i + 1) / divisions;

            for (let i = 0; i < 2 * Math.PI; i += add){
                vert.push(base, base, top, base, top, top);
            }

            for (let i = 0; i < 2 * Math.PI; i += add){
                vert.push(base, base, base);
            }

            for (let i = 0; i < 2 * Math.PI; i += add){
                vert.push(top, top, top);
            }

        }

        return vert;
    }

    static layerElements(sampling, normal){
        sampling.splice(normal,1);

        let elements = [];
        for (let b = 0; b < sampling[1] - 1; ++b){
            for (let a = 0; a < sampling[0] - 1; ++a){
                elements.push(a + 1 + b * sampling[1], a + b * sampling[1], a + sampling[0] + b * sampling[1]);
                elements.push(a + 1 + b * sampling[1], a + sampling[0] + b * sampling[1], a + 1 + sampling[0] + b * sampling[1]);
            }
        }

        return elements;

    }

    static get unitQuad(){
        return [
            -0.5, -0.5, 0,
            0.5, -0.5, 0,
            0.5, 0.5, 0,
            -0.5, -0.5, 0,
            0.5, 0.5, 0,
            -0.5, 0.5, 0,
        ];
    }

    static get unitQuadTex(){
        return [
            0, 1,
            1, 1,
            1, 0,
            0, 1,
            1, 0,
            0, 0,
        ];
    }
}