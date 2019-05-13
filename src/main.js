import addEvent from './common.js'
import fshape from './fshape.js'

async function main () {
  const gl = document.getElementById('c').getContext('webgl2')
  if (!gl) {
    window.alert('Webgl is not available in your browser')
  }
  const shape = await fshape.create().initialize(gl)
  window.requestAnimationFrame(fshape.drawScene.bind(shape))
}

addEvent(window, 'load', main)
