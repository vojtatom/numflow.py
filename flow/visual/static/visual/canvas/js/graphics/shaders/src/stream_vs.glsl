precision mediump float;

attribute vec3 position;
attribute float velocity;

varying vec3 fragColor;
varying float sigma;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

uniform float maxVel;
uniform float medianVel;
uniform float absDevVel;

uniform float brightness;

void main()
{

    float ratio = velocity / medianVel;
	sigma = (1.0 / (-ratio - 1.0)  + 1.0);
	sigma = pow(sigma, brightness);

	float r = pow(sigma, 2.0);
	float g = pow(sigma, 4.0);
	float b = pow(ratio + 1.0, -2.0);

	fragColor = vec3(r, g, b);
    
	gl_Position =  mProj * mView * mWorld * vec4(position, 1);
}