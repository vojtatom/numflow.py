#version 330

//out vec3 fcolor;
in float ofvalues;

vec3 mapcolor( float val ) {
    vec3 ret = vec3( val, 0.5, 1.0 - val);
    return ret;
}

void main() { 
    gl_FragColor = vec4(mapcolor(ofvalues), 1.0); 
    //gl_FragColor = vec4(1.0); 
} 