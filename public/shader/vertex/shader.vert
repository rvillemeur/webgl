#version 300 es

in vec4 a_position;
//in vec4 a_color;
in vec2 a_texcoord;

uniform mat4 u_matrix;

out vec4 v_color;
out vec2 v_texcoord;

void main() {
  gl_Position = u_matrix * a_position;

  // v_color = a_color;
  v_texcoord = a_texcoord;
}