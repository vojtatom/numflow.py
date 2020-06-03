#version 330

in vec3 pos;
in vec3 fvalue;

uniform mat4 view;
uniform mat4 projection;

uniform float amin;
uniform float amax;
uniform vec3 normal;

out vec3 fcolor;
out float ofvalues;

vec3 phong(vec3 light, vec3 ver_position, vec3 ver_normal){
    vec3 ret = vec3(0.0);
    
    vec3 L = normalize(-light);
    float NdotL = clamp(dot(normalize(ver_normal), L), 0.0, 1.0);
   
   	//ambient
	ret += vec3(0.8);
	
	//diffuse
    ret += vec3(1.0) * NdotL;
    return ret;
}

float scaledMagnitude(vec3 value)
{
	float len = length(value);
	return (len - amin) / (amax - amin);
}


void main() { 
	float amag = scaledMagnitude(fvalue);

	gl_Position = projection * view * vec4(pos, 1.0);

	vec3 light = vec3(0., 100., -100.);
	fcolor = phong(light, pos, normal);
	ofvalues = amag;
} 