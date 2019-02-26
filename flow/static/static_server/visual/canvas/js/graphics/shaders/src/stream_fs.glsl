precision highp float;
precision highp int;

varying vec3 fragColor;
varying float sigma;
varying float visible;

/**
 * 0 - transparent
 * 1 - solid
 */
uniform int appearance;


void main()
{
    //should be 1.0 but on some nvidia cards that seems not to be exactly the value
    if (visible < 0.9)
        discard; 

    if (appearance == 0){
        gl_FragColor = vec4(fragColor, 0.3 + sigma * 0.7);
    } else {
        gl_FragColor = vec4(fragColor, 1.0);
    }
}