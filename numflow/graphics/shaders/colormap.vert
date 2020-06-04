#version 330

in vec2 pos;
out float val;

uniform float screenwidth;
uniform float screenheight;

void main() { 
    val = pos.y;
    float px_x = (screenwidth / 2.0);
    float px_y = (screenheight / 2.0);

    float strip_width_px = 20.0;
    float strip_border_offset_px = 20.0;

    vec2 vert = pos;
    //setup width and left offset 
    vert.x = (vert.x / px_x) * strip_width_px + strip_border_offset_px / px_x;
    //setup top offset
    vert.y = vert.y * ((px_y - strip_border_offset_px) / px_y);
    //move to the left
    vert = vert - vec2(1.0, 0.0);

	gl_Position = vec4(vert, 0.0f, 1.0f);
} 