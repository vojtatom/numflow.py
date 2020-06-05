#version 330


in vec3 pos;

uniform vec3 low;
uniform vec3 high;

uniform mat4 view;
uniform mat4 projection;


void main() { 
    vec3 size = high - low;
	vec3 vert = pos * size + low;
    
	gl_Position = projection * view * vec4(vert, 1.0f);
} 