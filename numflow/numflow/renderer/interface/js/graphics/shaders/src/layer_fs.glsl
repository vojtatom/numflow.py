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
    vec4 color = (float(appearance == 1) + float(appearance == 2)) * vec4(fragColor, 1.0);
    color += float(appearance == 0) * vec4(fragColor, 0.3 + sigma * 0.7);
    gl_FragColor = color;
}