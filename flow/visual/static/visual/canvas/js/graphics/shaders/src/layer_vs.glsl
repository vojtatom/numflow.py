precision mediump float;
precision highp int;


/***** LAYER SHADER ******/


//buffer attributes
//attribute vec3 vertPosition;
//attribute vec3 vertNormal;
attribute vec3 fieldPosition;
attribute vec3 fieldValue;

/***** UNIFORMS ******/

//geometry settings
uniform vec3 cameraPosition;
uniform vec3 normal;

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
uniform vec4 colorMap[5];
uniform float farplane;

//scale and shift
uniform float scaleFactor;
uniform vec3 shift;

/*** END COMMON UNIFORMS ***/

//out
varying vec3 fragColor;
varying float sigma;


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


/**
 * Calculate significance
 */
float significance(float l) {
	//positive for vector longer than median, normalized by std...
	//float dist = (l - medianSize) / stdSize;
	//applying sigmoid to transform... 
	//sigma \elem [0, 1] is sort of significance value for the vector...?
	//return 1.0 / (1.0 + exp(-dist));
	return (l - minSize) / (maxSize - minSize);
}

/**
 * Transform normal according to point of view
 */
vec3 transform_normal(vec4 shiftPosition) {
	vec3 camera_vec = cameraPosition - shiftPosition.xyz;
	float cosine = dot(normalize(normal), normalize(camera_vec));

	//check form which angle is the cammera looking
	vec3 transformed_normal = float(cosine < 0.0) * -normal;
	transformed_normal += float(cosine >= 0.0) * normal;
	return transformed_normal;
}

float applyModeLength(vec3 value){
	float val = float(mode == 0) * length(value);
	val += float(mode == 1) * value.x;
	val += float(mode == 2) * value.y;
	val += float(mode == 3) * value.z;
	return val;
}


void main(){	
	//calculate vector significance
	sigma = significance(applyModeLength(fieldValue));

	//shift position of the vertex
	vec4 vertex = mWorld * vec4(scaleshift(fieldPosition), 1.0);

	//shade
	vec3 transformed_normal = transform_normal(vertex);
	vec3 color = float(appearance == 1) * phong(light, sigma, vertex.xyz, transformed_normal);
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