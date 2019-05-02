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
  const positionBuffer = gl.createBuffer()

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  // 2 triangles, leading to a rectangle
  var positions = [
    10, 20,
    80, 20,
    10, 30,
    10, 30,
    80, 20,
    80, 30
  ]

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

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

  const primitiveType = gl.TRIANGLES
  const count = 6
  gl.drawArrays(primitiveType, offset, count)
}

addEvent(window, 'load', drawScene)
