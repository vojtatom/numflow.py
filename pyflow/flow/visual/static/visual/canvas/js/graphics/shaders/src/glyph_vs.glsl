precision mediump float;
precision highp int;

/***** GLYPH SHADER ******/

//buffer attributes
attribute vec3 vertPosition;
attribute vec3 vertNormal;
attribute vec3 fieldPosition;
attribute vec3 fieldValue;

/***** UNIFORMS ******/

//geometry settings
uniform float size;

/*** COMMON UNIFORMS ***/
//matrices
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

//world settings
uniform vec3 light;

//stats
uniform float minSize;
uniform float maxSize;
uniform float meanSize;
uniform float medianSize;
uniform float stdSize;

//geometry
uniform int appearance; /* 0 - transparent, 1 - solid */
uniform float brightness;
uniform int mode;

//color map
uniform int colorMapSize;
uniform int colorMode;
uniform vec4 colorMap[5];
uniform float farplane;

//scale and shift
uniform float scaleFactor;
uniform vec3 shift;
uniform float gamma;
/*** END COMMON UNIFORMS ***/

//out
varying vec3 fragColor;
varying float sigma;



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

/**
 * Phong
 */
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

/**
 * Get color from colormap
 */
vec3 colorfunc(float sigma) {
	float index = float(colorMapSize - 1) * sigma;
	int low = int(floor(index));
	int high = int(ceil(index));
	float factor = index - floor(index);

	return (colorMap[low] * (1.0 - factor) + colorMap[high] * factor).xyz;
}

/**
 * Space shift and scale
 */
vec3 scaleshift(vec3 position) {
	return (position - shift) * scaleFactor;
}


float significance(float l) {
	//positive for vector longer than median, normalized by std...
	//float dist = (l - medianSize) / stdSize;
	//applying sigmoid to transform... 
	//sigma \elem [0, 1] is sort of significance value for the vector...?
	//return 1.0 / (1.0 + exp(-dist));

	//in case the centering is not possible, which means both min and max are positive or negative
	float range = minSize * maxSize;
	float sig = float(range >= 0.0) * ((l - minSize) / (maxSize - minSize));
	// min ------------------------ 0 --------------------------- max
	// range complete (simple)
	sig += float(range < 0.0) * float(colorMode == 1) * ((l - minSize) / (maxSize - minSize));
	// range optical (scaled)
	sig += float(range < 0.0) * float(colorMode == 0) *((l + max(maxSize, -minSize)) / (2.0 * max(maxSize, -minSize)));
	
	//gamma correction
	sig = clamp(sig, 0.0, 1.0);
	sig = pow(sig, gamma);
	return sig;
}


float applyModeLength(vec3 value){
	float val = float(mode == 0) * length(value);
	val += float(mode == 1) * value.x;
	val += float(mode == 2) * value.y;
	val += float(mode == 3) * value.z;
	return val;
}

void main(){	
	//mapping vector length according to median value of vector lengths
	sigma = significance(applyModeLength(fieldValue));

	//transform glyph vertex into place
	mat4 mField = getRotationMat(fieldValue);
	vec4 vertex = mWorld * mField * vec4(vertPosition * size * sigma, 1.0);
	vertex = vertex + vec4(scaleshift(fieldPosition), 0.0);
	vec4 vertex_normal = mWorld * mField * vec4(vertNormal, 1.0);

	//shade
	vec3 color = float(appearance == 1) * phong(light, sigma, vertex.xyz, vertex_normal.xyz);
	color += float(appearance == 0) * vec3(1.0);

	//rest of the coloring
	color *= colorfunc(sigma);
	color *= brightness;

	//finalize transformation
	gl_Position =  mProj * mView * vertex;
	
	//check for depth drawing
	color += float(appearance == 2) * vec3(1.0 - gl_Position.z / farplane);
	fragColor = color;
}