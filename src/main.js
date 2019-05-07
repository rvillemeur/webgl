import addEvent from './common.js'
import { createShader, createProgram, loadShader, loadScene } from './gl-utils.js'
import { m3 } from './gl-matrix.js'

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

  const scene = await loadScene('public\\scene\\f_letter.json')

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(scene.vertices), gl.STATIC_DRAW)

  // Set a random color.
  const color = [Math.random(), Math.random(), Math.random(), 1]
  const colorLocation = gl.getUniformLocation(program, 'u_color')
  gl.uniform4fv(colorLocation, color)

  // Compute the matrices
  const angleInRadians = 185 * Math.PI / 180
  const scale = [0.75, 0.75]
  const translation = [100, 100]
  const projectionMatrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight)
  const translationMatrix = m3.translation(translation[0], translation[1])
  const rotationMatrix = m3.rotation(angleInRadians)
  const scaleMatrix = m3.scaling(scale[0], scale[1])

  // make a matrix that will move the origin of the 'F' to its center.
  const moveOriginMatrix = m3.translation(-50, -75)

  var matrix = m3.multiply(projectionMatrix, translationMatrix)
  matrix = m3.multiply(matrix, scaleMatrix)
  matrix = m3.multiply(matrix, rotationMatrix)
  matrix = m3.multiply(matrix, moveOriginMatrix)

  // Set the matrix.
  const matrixLocation = gl.getUniformLocation(program, 'u_matrix')
  gl.uniformMatrix3fv(matrixLocation, false, matrix)

  const primitiveType = gl.TRIANGLES
  gl.drawArrays(primitiveType, offset, scene.numberOfVertices)
}

addEvent(window, 'load', drawScene)
