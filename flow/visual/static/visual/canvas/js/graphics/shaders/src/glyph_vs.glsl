precision mediump float;

attribute vec3 vertPosition;
attribute vec3 glyphPosition;
attribute vec3 fieldVector;

varying vec3 fragColor;
varying float sigma;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

uniform float glyphSize;
uniform float layer;
uniform int up;
uniform float medianSize;
uniform float devSize;

uniform float brightness;

/**
 * Create rotation matrix from field vector.
 * The returned matrix can rotate vector (1, 0, 0)
 * into the desired setup. Used to rotate glyphs according
 * to vecotr field
 */
mat4 getRotationMat()
{
	vec3 unit = vec3(1, 0, 0);
	vec3 f = normalize(fieldVector);
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

void main()
{
	float length = length(fieldVector);
	float ratio = length / medianSize;
	sigma = (1.0 / (-ratio - 1.0)  + 1.0);
	sigma = pow(sigma, brightness);
	
	float magRatio = pow(sigma, 1.0) * glyphSize;


	float r = pow(sigma, 2.0);
	float g = pow(sigma, 4.0);
	float b = pow(ratio + 1.0, -2.0);
	fragColor = vec3(r, g, b);

	mat4 mField = getRotationMat();

	
	/*if(layer >= 0.0)
	{
		float delta = 0.0;
		if (up == 0)
			delta = abs(glyphPosition.x - layer);
		else if(up == 1)
			delta = abs(glyphPosition.y - layer);
		else
			delta = abs(glyphPosition.z - layer);
		if (delta > 8.0)
			sigma = 0.0;
		else 
			sigma *= (64.0 - pow(delta, 2.0)) / 64.0;
	}*/

	float xCoord = vertPosition.x * magRatio;
	vec2 yzCoord = vertPosition.yz * magRatio;
	vec3 glyph = (mField * vec4(xCoord, yzCoord, 1)).xyz;
	gl_Position =  mProj * mView * mWorld * vec4(glyph + glyphPosition, 1);
}