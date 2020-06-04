#version 330

in vec3 color;
in float cval;
in float fvalue;

uniform float min_thresh;
uniform float max_thresh;

vec3 mapcolor( float val ) {
    vec3 ret = vec3( val, 0.5, 1.0 - val);
    return ret;
}

void main() { 

    if (fvalue < min_thresh || fvalue > max_thresh)
        discard;


    gl_FragColor = vec4(color * mapcolor(cval), 1.0); 
    //gl_FragColor = vec4(1.0); 
} 