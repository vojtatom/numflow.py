precision mediump float;
precision highp int;

varying vec3 fragColor;


uniform int mode;

void main()
{
    if (mode == 0){
        gl_FragColor = vec4(fragColor, 0.5);
    } else {
        gl_FragColor = vec4(0, 0, 0, 0.0);
    }
}