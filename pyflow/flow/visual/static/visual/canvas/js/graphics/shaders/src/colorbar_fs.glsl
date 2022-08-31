precision mediump float;

// Passed in from the vertex shader.
varying vec3 color;

void main() {
   gl_FragColor = vec4(color, 1.0);
}