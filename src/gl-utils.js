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

async function loadShader (url) {
  try {
    const response = await window.fetch(url)
    return await response.text()
  } catch (e) {
    return e.message
  }
}

async function loadScene (url) {
  try {
    const response = await window.fetch(url)
    return await response.json()
  } catch (e) {
    return e.message
  }
}

export { createShader, createProgram, loadShader, loadScene }
