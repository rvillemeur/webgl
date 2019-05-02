/*
    boilterplate code to handle event between firefox and internet explorer
*/

export default function addEvent (obj, evType, fn) {
  if (obj.addEventListener) {
    obj.addEventListener(evType, fn, false)
    return true
  } else if (obj.attachEvent) {
    const r = obj.attachEvent('on' + evType, fn)
    return r
  } else {
    return false
  }
}
