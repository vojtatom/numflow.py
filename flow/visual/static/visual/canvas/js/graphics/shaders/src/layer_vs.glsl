precision mediump float;
precision highp int;

//buffer attributes
//attribute vec3 vertPosition;
//attribute vec3 vertNormal;
attribute vec3 fieldPosition;
attribute vec3 fieldValue;

uniform vec3 normal;

//matrices
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

uniform vec3 cameraPosition;


//stats and scaling
uniform float medianSize;
uniform float stdSize;
uniform float thickness;

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

//scale and shift
uniform float scaleFactor;
uniform vec3 shift;

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

//implementation for length (not direction!!!)
vec3 colorfunc(float sigma) {
	float index = float(colorMapSize - 1) * sigma;
	int low = int(floor(index));
	int high = int(ceil(index));
	float factor = index - floor(index);

	return (colorMap[low] * (1.0 - factor) + colorMap[high] * factor).xyz;
}


vec3 scaleshift(vec3 position) {
	return (position - shift) * scaleFactor;
}


float significance(float l) {
	//positive for vector longer than median, normalized by std...
	float dist = (l - medianSize) / stdSize;
	//applying sigmoid to transform... 
	//sigma \elem [0, 1] is sort of significance value for the vector...?
	return 1.0 / (1.0 + exp(-dist));
}


void main()
{	
	sigma = significance(length(fieldValue));

	//perform shift
	vec3 shiftPosition = scaleshift(fieldPosition);

	//shade
	if (appearance == 1){
		//solid
		
		vec3 transformed_normal;
		vec3 camera_vec = cameraPosition - (mWorld * vec4(shiftPosition, 1.0)).xyz;
		float cosine = dot(normalize(normal), normalize(camera_vec));

		if (cosine < 0.0){
			transformed_normal = - normal;
		} else {
			transformed_normal = normal;
		}

		vec3 color = phong(light, sigma, shiftPosition, transformed_normal);
		color *= colorfunc(sigma);
		fragColor = color;

	} else {

		//transparent
		vec3 color = vec3(1.0);
		color *= colorfunc(sigma);
		fragColor = color;

	}

	gl_Position =  mProj * mView * mWorld * vec4(shiftPosition, 1.0);
}