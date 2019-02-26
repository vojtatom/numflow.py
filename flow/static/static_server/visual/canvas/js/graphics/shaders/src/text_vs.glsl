attribute vec3 position;
attribute vec2 texcoord;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

uniform vec2 labelSize;
uniform vec2 screenSize;

varying vec2 v_texcoord;


void main() {
    // Multiply the position by the matrix.

    gl_Position = mProj * mView * (mWorld * vec4(0, 0, 0, 1.0));
    gl_Position /= gl_Position.w;
    gl_Position.xy += (labelSize / screenSize) * position.xy;

    // Pass the texcoord to the fragment shader.
    v_texcoord = texcoord;
}