#version 330


in float val;
uniform float gamma;


vec3 colormap[8] = vec3[8]( vec3(0.18500126283629117,0.0,0.5300734481832133),
                            vec3(0.38464311940637147,0.0,0.6429409600399453),
                            vec3(0.5721456036395585,0.0,0.6501649022558448),
                            vec3(0.7277892230409964,0.18262842799644946,0.5406849435357364),
                            vec3(0.8476680354386845,0.35689530153852816,0.40995168748020866),
                            vec3(0.9345387621997825,0.5358342773205369,0.28442833985509985),
                            vec3(0.9633234911081278,0.7430429023051337,0.15436821379405674),
                            vec3(0.894058310302958,0.9822535793047805,0.0810687655704728));

vec3 mapcolor(float val) {
    val = pow(val, gamma);
    int bin_low = int(val * 7);

    if (bin_low == 7)
        return colormap[7];

    float fac = (val * 7) - float(bin_low);

    return colormap[bin_low] * (1.0 - fac) + colormap[bin_low + 1] * fac;
}


void main() { 

    gl_FragColor = vec4(mapcolor(val), 1.0); 
    //gl_FragColor = vec4(1.0); 
} 