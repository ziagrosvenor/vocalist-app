import UserMediaRecorder from '../lib/user-media-recorder/src/user_media_recorder'

window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.URL = window.URL || window.webkitURL;

const worker = new Worker('./lib/user-media-recorder/webworkers/wav_worker.js')
const config = {
  channels: 2,
}

export const microphone = (ctx) => {
  return navigator.mediaDevices.getUserMedia({audio: true})
    .then((stream) => {
      const source = ctx.createMediaStreamSource(stream)
      const sourceGain = ctx.createGain()
      const output = ctx.createGain()
      source.connect(sourceGain)
      let recorder = UserMediaRecorder(stream, worker, ctx, sourceGain, config);

      sourceGain.connect(output)
      recorder.output.gain.value = 0
      recorder.output.connect(output)

      return {
        node: output,
        startRecording() { recorder.startRecording() },
        stopRecording(callback) {
          recorder.stopRecording(callback)
          recorder.dispose()
          recorder = UserMediaRecorder(stream, worker, ctx, sourceGain, config);
          recorder.output.gain.value = 0
          recorder.output.connect(output)
        }
      }
    })
}
