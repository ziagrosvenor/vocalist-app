window.AudioContext = window.AudioContext || window.webkitAudioContext;

export function getContext() {
  let ctx

  // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext#Parameters
  // This throws an error in some browsers
  try {
    ctx = new AudioContext({latencyHint: 0.01})
  } catch (e) {
    ctx = new AudioContext()
  }

  return ctx
}
