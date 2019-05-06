import addEvent from './common.js'
import { createShader, createProgram, loadShader, loadScene } from './gl-utils.js'

function resize (canvas) {
  var cssToRealPixels = window.devicePixelRatio || 1

  // Lookup the size the browser is displaying the canvas in CSS pixels
  // and compute a size needed to make our drawingbuffer match it in
  // device pixels.
  var displayWidth = Math.floor(canvas.clientWidth * cssToRealPixels)
  var displayHeight = Math.floor(canvas.clientHeight * cssToRealPixels)

  // Check if the canvas is not the same size.
  if (canvas.width !== displayWidth ||
      canvas.height !== displayHeight) {
    // Make the canvas the same size
    canvas.width = displayWidth
    canvas.height = displayHeight
  }
}

async function drawScene () {
  const canvas = document.getElementById('c')
  const gl = canvas.getContext('webgl2')
  if (!gl) {
    window.alert('Webgl is not available in your browser')
  }
  resize(gl.canvas)
  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
    loadShader('public\\shader\\vertex\\shader.vert'),
    loadShader('public\\shader\\fragment\\fragment.frag')
  ])

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
  const program = createProgram(gl, vertexShader, fragmentShader)

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
  const positionBuffer = gl.createBuffer()

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  gl.enableVertexAttribArray(positionAttributeLocation)

  // 2 components per iteration
  const size = 2
  // the data is 32bit floats
  const type = gl.FLOAT
  // don't normalize the data
  const normalize = false
  // 0 = move forward size * sizeof(type) each iteration to get the next position
  const stride = 0
  // start at the beginning of the buffer
  const offset = 0
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)
  // Clear the canvas
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  // Tell it to use our program (pair of shaders)
  gl.useProgram(program)
  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao)

  // Pass in the canvas resolution so we can convert from
  // pixels to clipspace in the shader
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)

  const scene = await loadScene('public\\scene\\f_letter.json')

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(scene.vertices), gl.STATIC_DRAW)

  // Set a random color.
  const color = [Math.random(), Math.random(), Math.random(), 1]
  const colorLocation = gl.getUniformLocation(program, 'u_color')
  gl.uniform4fv(colorLocation, color)

  // Set the translation
  const translation = [120, 175]
  const translationLocation = gl.getUniformLocation(program, 'u_translation')
  gl.uniform2fv(translationLocation, translation)

  // Set the rotation.
  const angleInRadians = 45 * Math.PI / 180
  const rotation = [Math.sin(angleInRadians), Math.cos(angleInRadians)]
  const rotationLocation = gl.getUniformLocation(program, 'u_rotation')
  gl.uniform2fv(rotationLocation, rotation)

  // Set the scale
  const scale = [0.5, 0.5]
  const scaleLocation = gl.getUniformLocation(program, 'u_scale')
  gl.uniform2fv(scaleLocation, scale)

  const primitiveType = gl.TRIANGLES
  gl.drawArrays(primitiveType, offset, scene.numberOfVertices)
}

addEvent(window, 'load', drawScene)
