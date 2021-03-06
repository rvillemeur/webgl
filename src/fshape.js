import { createShader, createProgram, loadShader, loadScene } from './gl-utils.js'
import addEvent from './common.js'
import { glMatrix, vec3, mat4 } from 'gl-matrix'

const fshape = Object.assign(Object.create(Object.prototype), {
  resize: function resize (canvas) {
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
  },

  drawScene: async function drawScene (now) {
    // Convert the time to seconds
    now *= 0.001
    // Subtract the previous time from the current time
    var deltaTime = now - this.then
    // Remember the current time for the next frame.
    this.then = now

    const vao = await this.getVertexArrayObjet(this.gl, deltaTime)
    this.gl.bindVertexArray(vao)

    this.resize(this.gl.canvas)
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
    this.gl.clearColor(0.9, 0.9, 0, 0.5)
    // gl.enable(gl.CULL_FACE)
    this.gl.enable(this.gl.DEPTH_TEST)

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 96)
    window.requestAnimationFrame(this.drawScene.bind(this))
  },

  loadPosition: function loadPosition (gl, program, scene) {
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
    const positionBuffer = gl.createBuffer()
    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(scene.vertices), gl.STATIC_DRAW)
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0)
  },

  loadImage: async function loadImage (url, image) {
    try {
      const response = await window.fetch(url)
      const blob = await response.blob()
      const objectURL = URL.createObjectURL(blob)
      image.src = objectURL
    } catch (e) {
      return e.message
    }
  },

  loadTexture: async function loadTexture (gl, program, scene) {
    const textureAttributeLocation = gl.getAttribLocation(program, 'a_texcoord')
    const texcoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(scene.textures), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(textureAttributeLocation)
    gl.vertexAttribPointer(textureAttributeLocation, 2, gl.FLOAT, true, 0, 0)

    var image = new Image()
    image.src = 'public\\img\\f-texture.png'
    addEvent(image, 'load', () => {
      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.generateMipmap(gl.TEXTURE_2D)
    })
  },

  // loadColor: function loadColor (gl, program, scene) {
  //   // Set a random color.
  //   // const color = [Math.random(), Math.random(), Math.random(), 1]
  //   const colorAttributeLocation = gl.getAttribLocation(program, 'a_color')
  //   const colorBuffer = gl.createBuffer()
  //   gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  //   gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(scene.colors), gl.STATIC_DRAW)
  //   gl.enableVertexAttribArray(colorAttributeLocation)
  //   gl.vertexAttribPointer(colorAttributeLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0)
  // },

  computeMatrix: function computeMatrix (gl, program, deltaTime) {
    // console.log(pos)
    // Compute the matrices
    // this.rotationX += this.rotationSpeed * deltaTime
    this.rotationY += this.rotationSpeed * deltaTime

    const matrix = mat4.create()
    mat4.ortho(matrix, 0, gl.canvas.clientWidth, 0, gl.canvas.clientHeight, 400, -400)
    mat4.translate(matrix, matrix, this.translation)
    mat4.rotateX(matrix, matrix, this.rotationX)
    mat4.rotateY(matrix, matrix, this.rotationY)
    mat4.rotateZ(matrix, matrix, this.rotationZ)
    mat4.scale(matrix, matrix, this.scale)

    // Set the matrix.
    const matrixLocation = gl.getUniformLocation(program, 'u_matrix')
    gl.uniformMatrix4fv(matrixLocation, false, matrix)
  },
  setProgram: async function setProgram (gl) {
    const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
      loadShader('public\\shader\\vertex\\shader.vert'),
      loadShader('public\\shader\\fragment\\fragment.frag')
    ])

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    const program = createProgram(gl, vertexShader, fragmentShader)
    gl.useProgram(program)
    return program
  },

  getVertexArrayObjet: async function getVertexArrayObjet (gl, deltaTime) {
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    const program = await this.setProgram(gl)

    this.loadPosition(gl, program, this.scene)
    // this.loadColor(gl, program, this.scene)
    await this.loadTexture(gl, program, this.scene)
    this.computeMatrix(gl, program, deltaTime)

    gl.bindVertexArray(null)
    return vao
  },

  initialize: async function initialize (gl) {
    this.gl = gl
    this.scene = await loadScene('public\\scene\\f_letter_3d.json')
    return this
  },
  create: function create (value) {
    var self = Object.create(this)

    Object.defineProperties(self, {
      'gl': {
        value: null,
        writable: true
      },
      'scene': {
        value: null,
        writable: true
      },
      'then': {
        value: 0,
        writable: true
      },
      'rotationSpeed': {
        value: 1.2,
        writable: false
      },
      'rotationX': {
        value: glMatrix.toRadian(180),
        writable: true
      },
      'rotationY': {
        value: glMatrix.toRadian(60),
        writable: true
      },
      'rotationZ': {
        value: glMatrix.toRadian(25),
        writable: false
      },
      'scale': {
        value: vec3.fromValues(1, 1, 1),
        writable: false
      },
      'translation': {
        value: vec3.fromValues(150, 180, 0),
        writable: false
      }
    })

    return self
  }
})

export { fshape as default }
