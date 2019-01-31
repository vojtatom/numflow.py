precision mediump float;

varying vec3 fragColor;
varying float sigma;
varying float visible;

void main()
{
    //if (visible < 1.0)
    //    discard; 
    gl_FragColor = vec4(fragColor, 0.3 + sigma * 0.7);
}