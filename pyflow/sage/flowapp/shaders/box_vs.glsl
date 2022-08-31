precision mediump float;
precision highp int;

attribute vec3 vertPosition;


uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;


varying vec3 fragColor;

void main()
{
	fragColor = vec3(0.64, 1.0, 0.98);
	gl_Position =  mProj * mView * mWorld * vec4(vertPosition, 1.0);
}