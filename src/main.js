import addEvent from './common.js'

function createShader (gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }

  console.log(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
}

function createProgram (gl, vertexShader, fragmentShader) {
  var program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  var success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    return program
  }

  console.log(gl.getProgramInfoLog(program))
  gl.deleteProgram(program)
}

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

async function loadShader (url) {
  try {
    const response = await window.fetch(url)
    return await response.text()
  } catch (e) {
    return e.message
  }
}

// Returns a random integer from 0 to range - 1.
function randomInt (range) {
  return Math.floor(Math.random() * range)
}

// Fills the buffer with the values that define a rectangle.
function setRectangle (gl, x, y, width, height) {
  var x1 = x
  var x2 = x + width
  var y1 = y
  var y2 = y + height

  // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
  // whatever buffer is bound to the `ARRAY_BUFFER` bind point
  // but so far we only have one buffer. If we had more than one
  // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2]), gl.STATIC_DRAW)
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
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
  const colorLocation = gl.getUniformLocation(program, 'u_color')

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
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)

  // draw 50 random rectangles in random colors
  for (var ii = 0; ii < 50; ++ii) {
    // Setup a random rectangle
    setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300))

    // Set a random color.
    gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1)

    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES
    var count = 6
    gl.drawArrays(primitiveType, offset, count)
  }
}

addEvent(window, 'load', drawScene)
