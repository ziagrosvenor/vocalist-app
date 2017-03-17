window.AudioContext = window.AudioContext || window.webkitAudioContext;

let ctx

export function getContext() {
  if ( ctx ) return ctx

  // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext#Parameters
  // latencyHint causes an error in Safari
  try {
    ctx = new AudioContext({latencyHint: 0.01})
  } catch (e) {
    ctx = new AudioContext()
  }

  return ctx
}
