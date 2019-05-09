import addEvent from './common.js'
import { createShader, createProgram, loadShader, loadScene } from './gl-utils.js'
import { glMatrix, vec3, mat4 } from 'gl-matrix'

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
  gl.clearColor(0.9, 0.9, 0, 0.5)
  // gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)

  const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
    loadShader('public\\shader\\vertex\\shader.vert'),
    loadShader('public\\shader\\fragment\\fragment.frag')
  ])

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
  const program = createProgram(gl, vertexShader, fragmentShader)
  gl.useProgram(program)

  const scene = await loadScene('public\\scene\\f_letter_3d.json')

  // load position
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
  const positionBuffer = gl.createBuffer()
  gl.enableVertexAttribArray(positionAttributeLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(scene.vertices), gl.STATIC_DRAW)
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0)

  // Set a random color.
  // const color = [Math.random(), Math.random(), Math.random(), 1]
  const colorAttributeLocation = gl.getAttribLocation(program, 'a_color')
  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(scene.colors), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(colorAttributeLocation)
  gl.vertexAttribPointer(colorAttributeLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0)

  // Compute the matrices
  const rotationX = glMatrix.toRadian(215)
  const rotationY = glMatrix.toRadian(0)
  const rotationZ = glMatrix.toRadian(25)
  const scale = vec3.fromValues(1, 1, 1)
  const translation = vec3.fromValues(150, 180, 0)

  const matrix = mat4.create()
  mat4.ortho(matrix, 0, gl.canvas.clientWidth, 0, gl.canvas.clientHeight, 400, -400)
  mat4.translate(matrix, matrix, translation)
  mat4.rotateX(matrix, matrix, rotationX)
  mat4.rotateY(matrix, matrix, rotationY)
  mat4.rotateZ(matrix, matrix, rotationZ)
  mat4.scale(matrix, matrix, scale)

  // Set the matrix.
  const matrixLocation = gl.getUniformLocation(program, 'u_matrix')
  gl.uniformMatrix4fv(matrixLocation, false, matrix)

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, scene.numberOfVertices)
}

addEvent(window, 'load', drawScene)
