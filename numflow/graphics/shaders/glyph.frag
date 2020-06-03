#version 330

in vec3 fcolor;
in float ofvalues;

vec3 mapcolor( float val ) {
    vec3 ret = vec3( val, 0.5, 1.0 - val);
    return ret;
}

void main() { 
    //vec3 defcolor = vec3(0.5, 0.0, 0.5);
    //vec3 newcolor = mapcolor( fvalues );

    //gl_FragColor = vec4(1.0); 
    gl_FragColor = vec4(fcolor * mapcolor(ofvalues) , 1.0); 
} 