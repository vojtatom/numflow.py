#version 300 es
precision highp float;
precision highp int;

// Passed in from the vertex shader.
in vec3 color;

out vec4 outFragColor;

void main() {
   outFragColor = vec4(color, 1.0);
}