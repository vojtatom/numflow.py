#version 300 es
precision highp float;
precision highp int;

in vec3 position;
in vec2 texcoord;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

uniform vec2 labelSize;
uniform vec2 screenSize;

uniform int space;

out vec2 v_texcoord;

void main() {
    // Multiply the position by the matrix.

    vec4 threedpos = mProj * mView * mWorld * vec4(0, 0, 0, 1.0);
    threedpos /= threedpos.w;
    gl_Position = float(space == 0) * threedpos;
    gl_Position += float(space == 1) * (mWorld * vec4(0, 0, 0, 1.0));
    
    
    gl_Position.xy += (labelSize / screenSize) * clamp((screenSize.y / 1200.0), 0.9, 1.5) * (position.xy + float(space == 1) * vec2(0.5, 0.0));
    // Pass the texcoord to the fragment shader.
    v_texcoord = texcoord;
}