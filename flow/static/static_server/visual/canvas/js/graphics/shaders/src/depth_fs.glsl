precision mediump float;
precision highp int;

varying vec3 fragColor;
varying float sigma;

/**
 * 0 - transparent
 * 1 - solid
 */
uniform int appearance;

void main()
{
    float ndcDepth = (2.0 * gl_FragCoord.z - gl_DepthRange.near - gl_DepthRange.far) / (gl_DepthRange.far - gl_DepthRange.near);
    float clipDepth = ndcDepth / gl_FragCoord.w;
    gl_FragColor = vec4((clipDepth * 0.5) + 0.5); 
}