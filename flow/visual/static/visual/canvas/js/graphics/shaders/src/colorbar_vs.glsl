precision mediump float;
precision highp int;

/***** COLORBAR SHADER ******/

attribute vec3 position;

uniform vec2 barPos;
uniform vec2 barSize;
uniform vec2 screenSize;

uniform float minSize;
uniform float maxSize;

//color map
uniform int colorMapSize;
uniform vec4 colorMap[5];

uniform float gamma;

varying vec3 color;




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
	sig += float(range < 0.0) * ((l + max(maxSize, -minSize)) / (2.0 * max(maxSize, - minSize)));
	
	//gamma correction
	sig = clamp(sig, 0.0, 1.0);
	sig = pow(sig, gamma);
	return sig;
}



void main() {
    float vectorL = mix(maxSize, minSize, (-position.y / float(colorMapSize - 1)));
    float sigma = significance(vectorL);
    gl_Position = vec4(position.x * barSize.x * 2.0 + barPos.x - 1.0, position.y * barSize.y * 2.0 / (float(colorMapSize) - 1.0) + 1.0 - barPos.y, 0.0, 1.0);
    color = colorfunc(sigma);
}