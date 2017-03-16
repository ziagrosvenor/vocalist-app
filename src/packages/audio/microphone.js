import UserMediaRecorder from '../lib/user-media-recorder/src/user_media_recorder'
const worker = new Worker('/assets/webworkers/wav_worker.js')

export const microphone = (ctx) => {
  return navigator.mediaDevices.getUserMedia({audio: true})
    .then((stream) => {
      const source = ctx.createMediaStreamSource(stream)
      const sourceGain = ctx.createGain()
      const output = ctx.createGain()
      source.connect(sourceGain)
      let recorder = new UserMediaRecorder(Date.now(), stream, worker, ctx, sourceGain);

      sourceGain.connect(output)
      recorder.output.gain.value = 0
      recorder.output.connect(output)

      return {
        node: output,
        startRecording() { recorder.startRecording() },
        stopRecording(callback) {
          recorder.stopRecording(callback)
          recorder.output.disconnect(output)
          recorder.output = null
          recorder.dispose()
          recorder = new UserMediaRecorder(Date.now(), stream, worker, ctx, sourceGain);
          recorder.output.gain.value = 0
          recorder.output.connect(output)
        }
      }
    })
}
