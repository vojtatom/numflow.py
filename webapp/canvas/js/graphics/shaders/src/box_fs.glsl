#version 300 es
precision highp float;
precision highp int;

in vec3 fragColor;

out vec4 outFragColor;

void main()
{
    outFragColor = vec4(fragColor, 0.5);
}