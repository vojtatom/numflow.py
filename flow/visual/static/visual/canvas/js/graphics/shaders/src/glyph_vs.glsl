precision mediump float;
precision highp int;

//buffer attributes
attribute vec3 vertPosition;
attribute vec3 vertNormal;
attribute vec3 fieldPosition;
attribute vec3 fieldValue;

//matrices
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

//stats and scaling
uniform float glyphSize;
uniform float medianSize;
uniform float stdSize;

//modifications
uniform float brightness;
uniform vec3 light;
/**
 * 0 - transparent
 * 1 - solid
 */
uniform int appearance;
uniform int scale;

//color map
uniform int colorMapSize;
uniform vec4 colorMap[5];

//out
varying vec3 fragColor;
varying float sigma;

/**
 * Create rotation matrix from field vector.
 * The returned matrix can rotate vector (1, 0, 0)
 * into the desired setup. Used to rotate glyphs according
 * to vecotr field
 */
mat4 getRotationMat()
{
	vec3 unit = vec3(1, 0, 0);
	vec3 f = normalize(fieldValue);
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

void main()
{	
	//mapping vector length according to median value of vector lengths
	float l = length(fieldValue);
	//positive for vector longer than median, normalized by std...
	float dist = (l - medianSize) / stdSize;
	//applying sigmoid to transform... 
	//sigma \elem [0, 1] is sort of significance value for the vector...?
	sigma = 1.0 / (1.0 + exp(-dist));
	float magRatio = glyphSize * sigma;

	//transform glyph vertex into place
	mat4 mField = getRotationMat();
	vec3 vertex = (mField * vec4(vertPosition * magRatio, 1.0)).xyz;
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

	gl_Position =  mProj * mView * mWorld * vec4(vertex + fieldPosition, 1.0);
}