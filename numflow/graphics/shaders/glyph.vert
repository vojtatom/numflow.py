#version 330

in vec3 pos;
//in vec3 normal;
//in vec3 fvalues;
//in vec3 shift;   // to shift the glyph vertices to position

uniform mat4 view;
uniform mat4 projection;

//out vec3 fcolor;
//out vec3 ofvalues;

/*vec3 phong(vec3 light, vec3 ver_position, vec3 ver_normal){
    vec3 ret = vec3(0.0);
    
    vec3 L = normalize(-light);
    float NdotL = clamp(dot(normalize(ver_normal), L), 0.0, 1.0);
   
   	//ambient
	ret += vec3(0.8);
	
	//diffuse
    ret += vec3(1.0) * NdotL;
    return ret;
}

mat4 getRotationMat(vec3 vector)
{
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

}*/

void main() { 
	//mat4 rot = getRotationMat(fvalues); // fvalues here
	//vec4 vertex = vec4(pos, 1.0);
	gl_Position = projection * view * vec4(pos, 1.0f);

	//vec3 light = vec3(0., 100., -100.);
	//fcolor = vec3(1, 1, 1);//phong(light, vertex.xyz, normal);
	//ofvalues = fvalues;
} 