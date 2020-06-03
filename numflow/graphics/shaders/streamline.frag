#version 330

in vec3 color;
in float cval;

vec3 mapcolor( float val ) {
    vec3 ret = vec3( val, 0.5, 1.0 - val);
    return ret;
}

void main() { 
    gl_FragColor = vec4(color * mapcolor(cval), 1.0); 
    //gl_FragColor = vec4(1.0); 
} 