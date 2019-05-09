#version 300 es

in vec4 a_position;
in vec4 a_color;

uniform mat4 u_matrix;

// a varying the color to the fragment shader
out vec4 v_color;

void main() {
  gl_Position = u_matrix * a_position;

  // Pass the color to the fragment shader.
  v_color = a_color;
}