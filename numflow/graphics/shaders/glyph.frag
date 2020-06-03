#version 330

//in vec3 fcolor;

//in vec3 fvalues;

//vec3 mapcolor( vec3 val ) {
//    float x = length(val);
//    vec3 ret = vec3( 1., 2. * x/10., 0. );
//    return ret;
//}

void main() { 
    //vec3 defcolor = vec3(0.5, 0.0, 0.5);
    //vec3 newcolor = mapcolor( fvalues );

    gl_FragColor = vec4(1.0); 
    //gl_FragColor = vec4(fcolor * newcolor, 1.0); 
} 