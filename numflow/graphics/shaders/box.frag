#version 330


uniform vec3 color;

void main() { 
    gl_FragColor = vec4(color, 0.5); 
} 