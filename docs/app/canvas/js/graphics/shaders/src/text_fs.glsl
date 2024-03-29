#version 300 es
precision highp float;
precision highp int;

// Passed in from the vertex shader.
in vec2 v_texcoord;

uniform sampler2D s_texture;

out vec4 outFragColor;

void main() {
   outFragColor = vec4(texture(s_texture, v_texcoord));
}