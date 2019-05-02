#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

// we need to declare an output for the fragment shader
out vec4 outColor;
void main() {
  // Just set the output to a constant redish-purple
  // 1 for red, 0 for green, 0.5 for blue, 1 for alpha.
  // Colors in WebGL go from 0 to 1.
  outColor = vec4(1, 0, 0.5, 1);
}