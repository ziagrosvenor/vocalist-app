function loadBuffer(ctx, url) {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // Decode asynchronously
    request.onload = function() {
      ctx.decodeAudioData(request.response, resolve, reject);
    }

    request.onerror = reject
    request.send();
  })
}

function createTrack(ctx, buffer) {
  const output = ctx.createGain()

  return {
    node: output,
    play() {
      this.source = ctx.createBufferSource(); // creates a sound source
      this.source.connect(this.node)
      this.source.buffer = buffer;
      this.source.start(0)
    },
    stop() {
      this.source.stop(0)
      this.source.disconnect(this.node)
      this.source = null
    }
  }
}

export const audioSource = (ctx, config) => (
  loadBuffer(ctx, config.url)
    .then((buffer) => createTrack(ctx, buffer))
)
