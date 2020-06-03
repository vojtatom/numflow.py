#version 330


in vec3 vertPos;
in vec3 vertNormal;
in float t_local;

//per instance
in vec3 fieldPosition0;
in vec3 fieldPosition1;
in vec3 fieldPosition2;
in vec3 fieldPosition3;
in vec3 fieldValue0;
in vec3 fieldValue1;
in vec3 fieldValue2;
in vec3 fieldValue3;
in vec4 t_global;

uniform mat4 view;
uniform mat4 projection;

uniform float amin;
uniform float amax;


out float cval;
out vec3 color;

/**
 * Create rotation matrix from field vector.
 * The returned matrix can rotate vector (1, 0, 0)
 * into the desired setup. Used to rotate glyphs according
 * to vecotr field
 */
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

}

vec3 phong(vec3 light, float sigma, vec3 ver_position, vec3 ver_normal){
    vec3 ret = vec3(0.0);
    
    vec3 L = normalize(-light);
    float NdotL = clamp(dot(normalize(ver_normal), L), 0.0, 1.0);
   
   	//ambient
	ret += vec3(0.8);
	
	//diffuse
    ret += vec3(1.0) * NdotL;
    
    return ret;
}

//interpolate using hermit
vec3 interpolateVec(float t, vec3 v0, vec3 v1, vec3 vt0,vec3 vt1) {

	vec3 c1, c2, c3, c4;

	c1 =    1.0 * v0;
	c2 = 		                + 1.0 * vt0;
	c3 =  - 3.0 * v0 + 3.0 * v1 - 2.0 * vt0 - 1.0 * vt1;
	c4 =    2.0 * v0 - 2.0 * v1 + 1.0 * vt0 + 1.0 * vt1;

	return(((c4 * t + c3) * t + c2) * t + c1);
}	

//interpolate using hermit
vec3 interpolateNorm(float t, vec3 v0, vec3 v1, vec3 vt0,vec3 vt1) {

	vec3 c1, c2, c3;

	c1 = 		                + 1.0 * vt0;
	c2 =  - 6.0 * v0 + 6.0 * v1 - 4.0 * vt0 - 2.0 * vt1;
	c3 =    6.0 * v0 - 6.0 * v1 + 3.0 * vt0 + 3.0 * vt1;

	return ((c3 * t + c2) * t + c1);
}

//interpolate using catmull rom spline
float interpolate(float t, float v0, float v1, float v2,float v3) {

	float c1, c2, c3, c4;

	c1 =  	         1.0 * v1;
	c2 = -0.5 * v0            + 0.5 * v2;
	c3 =  1.0 * v0 - 2.5 * v1 + 2.0 * v2 - 0.5 * v3;
	c4 = -0.5 * v0 + 1.5 * v1 - 1.5 * v2 + 0.5 * v3;

	return(((c4 * t + c3) * t + c2) * t + c1);
}

float applyModeLength(vec3 value){
    float val = length(value);
	//float val = float(mode == 0) * length(value);
	//val += float(mode == 1) * value.x;
	//val += float(mode == 2) * value.y;
	//val += float(mode == 3) * value.z;
	return val;
}

void main(){
	//interpolate corresponding time factor (streamline parameter)
	//float t = interpolate(t_local, t_global.x, t_global.y, t_global.z, t_global.w);

	//tangent vectors
	vec3 vtan0 = (fieldPosition2 - fieldPosition0) / 2.0;
	vec3 vtan1 = (fieldPosition3 - fieldPosition1) / 2.0;

	//tangent lengths
	float ltan0 = length(vtan0);
	float ltan1 = length(vtan1);

	//construct tangents
	vec3 tan0 = ltan0 * normalize(fieldValue1);
	vec3 tan1 = ltan1 * normalize(fieldValue2);

	//interpolate actual values from precalculated local points
	vec3 position = interpolateVec(t_local, fieldPosition1, fieldPosition2, tan0, tan1);
	vec3 value = interpolateNorm(t_local, fieldPosition1, fieldPosition2, tan0, tan1);

	float v0 = applyModeLength(fieldValue0);
	float v1 = applyModeLength(fieldValue1);
	float v2 = applyModeLength(fieldValue2);
	float v3 = applyModeLength(fieldValue3);

	//interpolate vector length
	float l = interpolate(t_local, v0, v1, v2, v3);	
	float sigma = 1.0;

	//transform vertex into place
	mat4 mField = getRotationMat(value);
	vec4 vertex = mField * vec4(vertPos, 1.0);
	vertex = vertex + vec4(position, 0.0);
	vec4 vertex_normal = mField * vec4(vertNormal, 1.0);
	
	//shade
    vec3 light = vec3(0., 100., -100.);
	color = phong(light, sigma, vertex.xyz, vertex_normal.xyz);
	//color += float(appearance == 0) * vec3(1.0);

	//rest of the coloring
	//color *= colorfunc(sigma);
	//color *= brightness;

	//finalize transformation
	gl_Position =  projection * view * vertex;
	
    cval = l;
	//check for depth drawing
	//color += float(appearance == 2) * vec3(1.0 - gl_Position.z / farplane);
	//fragColor = color;
}