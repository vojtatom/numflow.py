#version 300 es
precision highp float;
precision highp int;

in vec3 fragColor;
in float sigma;
in float o_time;

uniform vec2 time;

/**
 * 0 - transparent
 * 1 - solid
 */
uniform int appearance;

out vec4 outFragColor;

void main()
{
    //should be 1.0 but on some nvidia cards that seems not to be exactly the value
    float visible = float(time.x <= o_time && time.y >= o_time);
    if (visible < 0.9)
        discard; 
        
    vec4 color = (float(appearance == 1) + float(appearance == 2)) * vec4(fragColor, 1.0);
    color += float(appearance == 0) * vec4(fragColor, 0.3 + sigma * 0.7);
    outFragColor = color;
}