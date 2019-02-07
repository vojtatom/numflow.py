precision highp float;
precision highp int;

attribute vec3 vertPosition;
attribute vec3 vertNormal;
attribute float t_local;

//per instance
attribute vec3 fieldPosition0;
attribute vec3 fieldPosition1;
attribute vec3 fieldPosition2;
attribute vec3 fieldPosition3;
attribute vec3 fieldValue0;
attribute vec3 fieldValue1;
attribute vec3 fieldValue2;
attribute vec3 fieldValue3;
attribute vec4 t_global;

//matrices
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

//stats and scaling
uniform float medianSize;
uniform float stdSize;

//modifications
uniform float brightness;
uniform float thickness;
uniform vec3 light;
/**
 * 0 - transparent
 * 1 - solid
 */
uniform int appearance;
uniform int scale;
uniform vec2 time;

//color map
uniform int colorMapSize;
uniform vec4 colorMap[5];

//out
varying vec3 fragColor;
varying float sigma;
varying float visible;


/**
 * Create rotation matrix from field vector.
 * The returned matrix can rotate vector (1, 0, 0)
 * into the desired setup. Used to rotate glyphs according
 * to vecotr field
 */
mat4 getRotationMat(vec3 value)
{
	vec3 unit = vec3(1, 0, 0);
	vec3 f = normalize(value);
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

/**
 * Phong
 */
vec3 phong(vec3 light, float sigma, vec3 ver_position, vec3 ver_normal){
    vec3 ret = vec3(0.0);
    
    vec3 L = normalize(-light);
    float NdotL = clamp(dot(normalize(ver_normal), L), 0.0, 1.0);
   
   	//ambient
	ret += vec3(0.3);
	
	//diffuse
    ret += vec3(1.0) * NdotL;
    
    return ret;
}

//implementation for length (not direction!!!)
vec3 colorfunc(float sigma) {
	float index = float(colorMapSize - 1) * sigma;
	int low = int(floor(index));
	int high = int(ceil(index));
	float factor = index - floor(index);

	return (colorMap[low] * (1.0 - factor) + colorMap[high] * factor).xyz;
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


void main(){
	float t = interpolate(t_local, t_global.x, t_global.y, t_global.z, t_global.w);
	if (time.x <= t && time.y >= t){
		visible = 1.0;
	} else {
		visible = 0.0;
	}

	vec3 vtan0 = (fieldPosition2 - fieldPosition0) / 2.0;;
	vec3 vtan1 = (fieldPosition3 - fieldPosition1) / 2.0;

	float ltan0 = length(vtan0);
	float ltan1 = length(vtan1);

	vec3 tan0 = ltan0 * normalize(fieldValue1);
	vec3 tan1 = ltan1 * normalize(fieldValue2);

	vec3 position = interpolateVec(t_local, fieldPosition1, fieldPosition2, tan0, tan1);
	vec3 value = interpolateNorm(t_local, fieldPosition1, fieldPosition2, tan0, tan1);

	float v0 = length(fieldValue0);
	float v1 = length(fieldValue1);
	float v2 = length(fieldValue2);
	float v3 = length(fieldValue3);

	float l = interpolate(t_local, v0, v1, v2, v3);
	//positive for vector longer than median, normalized by std...
	float dist = (l - medianSize) / stdSize;
	//applying sigmoid to transform... 
	//sigma \elem [0, 1] is sort of significance value for the vector...?
	sigma = 1.0 / (1.0 + exp(-dist));

	//transform vertex into place
	mat4 mField = getRotationMat(value);
	vec3 vertex = (mField * vec4(vertPosition * thickness, 1.0)).xyz;
	vec3 vertex_normal = (mField * vec4(vertNormal, 1.0)).xyz;

	//shade
	if (appearance == 1){
		//solid
		vec3 color = phong(light, sigma, (mWorld * vec4(vertex, 1.0)).xyz, (mWorld * vec4(vertex_normal, 1)).xyz);
		color *= colorfunc(sigma);
		fragColor = color;
	} else {
		//transparent
		vec3 color = vec3(1.0);
		color *= colorfunc(sigma);
		fragColor = color;
	}

	gl_Position =  mProj * mView * mWorld * vec4(vertex + position, 1.0);
}