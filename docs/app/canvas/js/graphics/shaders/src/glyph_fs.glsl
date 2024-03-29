#version 300 es
precision highp float;
precision highp int;

in vec3 fragColor;
in float sigma;

/**
 * 0 - transparent
 * 1 - solid
 */
uniform int appearance;

out vec4 outFragColor;

void main()
{
    vec4 color = (float(appearance == 1) + float(appearance == 2)) * vec4(fragColor, 1.0);
    color += float(appearance == 0) * vec4(fragColor, 0.3 + sigma * 0.7);
    outFragColor = color;
}