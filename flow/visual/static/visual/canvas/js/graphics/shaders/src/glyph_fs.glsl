precision mediump float;
precision highp int;

varying vec3 fragColor;
varying float sigma;

/**
 * 0 - transparent
 * 1 - solid
 */
uniform int appearance;

void main()
{
  if (appearance == 1){
    gl_FragColor = vec4(fragColor, 1.0);
  } else {
    gl_FragColor = vec4(fragColor, sigma);
  }
}