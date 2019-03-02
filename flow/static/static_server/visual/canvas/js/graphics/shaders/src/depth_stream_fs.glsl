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

    float ndcDepth = (2.0 * gl_FragCoord.z - gl_DepthRange.near - gl_DepthRange.far) / (gl_DepthRange.far - gl_DepthRange.near);
    float clipDepth = ndcDepth / gl_FragCoord.w;
    gl_FragColor = vec4((clipDepth * 0.5) + 0.5); 
}