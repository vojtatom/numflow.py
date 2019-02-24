'use strict';

class Appearance {
    static get solid() {
        return 1;
    }

    static get transparent() {
        return 0;
    }

    static get encode() {
        return {
            transparent: 0,
            solid: 1,
        };
    }

    static get decode() {
        return ['transparent', 'solid'];
    }
}


class Scale {
    static get log() {
        return 0;
    }

    static get normal() {
        return 1;
    }

    static get encode() {
        return {
            log: 0,
            normal: 1,
        };
    }

    static get decode() {
        return ['log', 'normal'];
    }
}

class CoordMode {
    static get xyz(){
        return 0;
    }

    static get x(){
        return 1;
    }

    static get y(){
        return 2;
    }

    static get z(){
        return 3;
    }

    static get encode() {
        return {
            xyz: 0,
            x: 1,
            y: 2,
            z: 3,
        };
    }

    static get decode() {
        return ['xyz', 'x', 'y', 'z'];
    }
}


