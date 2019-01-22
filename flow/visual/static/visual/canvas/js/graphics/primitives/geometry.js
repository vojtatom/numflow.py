'use strict';

class Geometry{
    static get glyphVert(){
        let l = 0.1;
        let m = 1;
        
        return [
            0, 0, 0,
            m, 0, 0,
            m, 0, l,

            0, 0, 0,
            m, 0, l,
            0, 0, l,

            m, 0, 0,
            m, l, 0,
            m, l, l,

            m, 0, 0,
            m, l, l,
            m, 0, l,

            m, l, l,
            m, l, 0,
            0, l, 0,

            m, l, l,
            0, l, 0,
            0, l, l,  
            
            0, l, l,
            0, l, 0,
            0, 0, 0,

            0, l, l,
            0, 0, 0,
            0, 0, l,

            0, 0, l,
            m, 0, l,
            m, l, l,

            0, 0, l,
            m, l, l,
            0, l, l,

            m, l, 0,
            m, 0, 0,
            0, 0, 0,

            0, l, 0,
            m, l, 0,
            0, 0, 0,
        ];
    }

    static get glyphNorm(){
        return [
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,

            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
        ];
    }

    static get appearance(){
        return {
            transparent: 0,
            solid: 1,
        }
    }

    static get scale(){
        return {
            log: 0,
            normal: 1,
        }
    }
}