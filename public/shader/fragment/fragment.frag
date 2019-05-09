#version 300 es

precision mediump float;

// the varied color passed from the vertex shader
in vec4 v_color;

out vec4 outColor;
void main() {
  outColor = v_color;
}