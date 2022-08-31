precision mediump float;
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
        
    vec4 color = (float(appearance == 1) + float(appearance == 2)) * vec4(fragColor, 1.0);
    color += float(appearance == 0) * vec4(fragColor, 0.3 + sigma * 0.7);
    gl_FragColor = color;
}