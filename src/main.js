import addEvent from './common.js'
import fshape from './fshape.js'

function main () {
  const gl = document.getElementById('c').getContext('webgl2')
  if (!gl) {
    window.alert('Webgl is not available in your browser')
  }
  window.requestAnimationFrame(fshape.drawScene.bind(fshape.create().initialize(gl)))
}

addEvent(window, 'load', main)
