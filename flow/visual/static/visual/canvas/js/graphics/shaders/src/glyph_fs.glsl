precision mediump float;

varying vec3 fragColor;
varying float sigma;

void main()
{
  gl_FragColor = vec4(fragColor, 0.5 + pow(sigma, 0.5));
}