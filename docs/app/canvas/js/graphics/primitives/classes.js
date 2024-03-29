'use strict';

class Appearance {
    static get solid() {
        return 1;
    }

    static get transparent() {
        return 0;
    }

    static get depth() {
        return 2;
    }

    static encode(a) {
        return {
            transparent: 0,
            solid: 1,
            depth: 2,
        }[a];
    }

    static decode(a) {
        return ['transparent', 'solid', 'depth'][a];
    }
}


class Scale {
    static get log() {
        return 0;
    }

    static get normal() {
        return 1;
    }

    static encode(a) {
        return {
            log: 0,
            normal: 1,
        }[a];
    }

    static decode(a) {
        return ['log', 'normal'][a];
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

    static encode(a) {
        return {
            xyz: 0,
            x: 1,
            y: 2,
            z: 3,
        }[a];
    }

    static decode(a) {
        return ['xyz', 'x', 'y', 'z'][a];
    }
}

class TextMode {
    static get threeSpace() {
        return 0;
    }

    static get screenSpace() {
        return 1;
    }

    static encode(a) {
        return {
            threeSpace: 0,
            screenSpace: 1,
        }[a];
    }

    static decode(a) {
        return ['threeSpace', 'screenSpace'][a];
    }
}

