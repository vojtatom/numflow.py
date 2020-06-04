#version 330

in vec3 pos;
in vec3 normal;
in vec3 fvalues;
in vec3 shift;   // to shift the glyph vertices to position

uniform mat4 view;
uniform mat4 projection;

uniform float amin;
uniform float amax;

out vec3 fcolor;
out float ofvalues;
out vec3 fpos;

uniform float gamma;
uniform int resize;
uniform float size;
uniform vec3 selectedLow;
uniform vec3 selectedHigh;

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

mat4 getRotationMat(vec3 vector)
{
	if (vector == vec3(1, 0, 0))
		return mat4(1.0);

	vec3 unit = vec3(1, 0, 0);
	vec3 f = normalize(vector);
	vec3 cross = cross(f, unit);
	vec3 a = normalize(cross);
	float s = length(cross);
	float c = dot(f, unit);
	float oc = 1.0 - c;
	return mat4(oc * a.x * a.x + c,        oc * a.x * a.y - a.z * s,  oc * a.z * a.x + a.y * s,  0.0,
                oc * a.x * a.y + a.z * s,  oc * a.y * a.y + c,        oc * a.y * a.z - a.x * s,  0.0,
                oc * a.z * a.x - a.y * s,  oc * a.y * a.z + a.x * s,  oc * a.z * a.z + c,        0.0,
                0.0,                       0.0,                       0.0,                       1.0);

}

void main() { 
	float amag = scaledMagnitude(fvalues);
	vec3 tmppos = pos;

	if (resize == 1)
		tmppos = tmppos * pow(amag, gamma);

	mat4 rot = getRotationMat(fvalues); // fvalues here
	vec4 vertex = rot * vec4(tmppos * size, 1.0) + vec4(shift, 0);
	gl_Position = projection * view * vertex;

	vec3 light = vec3(0., 100., -100.);
	fcolor = phong(light, vertex.xyz, normal);
	ofvalues = amag;
	fpos = vertex.xyz;
} 