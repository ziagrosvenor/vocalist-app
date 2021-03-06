var defaultSampleRate = 44100,
    jobs = {};

function concatBuffers(buffers, totalLength) {
  var buf;
  var result = new Float32Array(totalLength);
  var offset = 0;
  var lng = buffers.length;
  for (var i = 0; i < lng; i++) {
    var buf = buffers[i];
    result.set(buf, offset);
    offset += buf.length;
  }
  return result;
}

function writeUTFBytes(view, offset, string) {
  var lng = string.length;
  for (var i = 0; i < lng; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function mergeBuffers(recBuffers, recLength){
  var result = new Float32Array(recLength);
  var offset = 0;
  for (var i = 0; i < recBuffers.length; i++){
    result.set(recBuffers[i], offset);
    offset += recBuffers[i].length;
  }
  return result;
}

function interleave(inputL, inputR){
  var length = inputL.length + inputR.length;
  var result = new Float32Array(length);

  var index = 0,
    inputIndex = 0;

  while (index < length){
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

this.addEventListener("message", function(evt) {
  var data = evt.data,
      uuid = data.uuid;

  switch (data.command) {
    case "init":
      if (!data.config) data.config = {};

      var job = {
        buffersL: [],
        buffersR: [],
        length: 0,
        sampleRate: data.config.samplerate || defaultSampleRate,
        channels: data.config.channels || 2
      };
      jobs[uuid] = job;

      this.postMessage({command: 'init', uuid: uuid, type: 'audio/wav'});
      break;
    case 'encode':
      var job = jobs[uuid];
      if (!job) return
      job.buffersL.push(new Float32Array(data.buffer[0]));
      job.length += data.buffer[0].length;

      break;
    case 'end':
      var job = jobs[uuid];
      var pcmBuffer = mergeBuffers(job.buffersL, job.length);


      var gainLevel = 'LOW_GAIN'

      for (var i = 0; i < pcmBuffer.length; i++) {
        var absValue = Math.abs(pcmBuffer[i]);
        if (absValue >= 0.3) {
          gainLevel = 'MID_GAIN'
        }
        if (absValue >= 1) {
          gainLevel = 'PEAKED_GAIN'
          break;
        }
      }

      var wavBuffer = new ArrayBuffer(44 + pcmBuffer.length * 2);
      var view = new DataView(wavBuffer);

      // RIFF chunk descriptor
      writeUTFBytes(view, 0, "RIFF");
      view.setUint32(4, 44 + pcmBuffer.length * 2, true);
      writeUTFBytes(view, 8, 'WAVE');

      // FMT sub-chunk
      writeUTFBytes(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);

      view.setUint16(22, job.channels, true); // one channel
      view.setUint32(24, job.sampleRate, true);
      view.setUint32(28, job.sampleRate * 4, true);
      view.setUint16(32, 4, true);
      view.setUint16(34, 16, true);

      // data sub-chunk
      writeUTFBytes(view, 36, 'data');
      view.setUint32(40, pcmBuffer.length * 2, true);

      // PCM samples
      var lng = pcmBuffer.length;
      var index = 44;
      var volume = 1;
      for (var i = 0; i < lng; i++) {
        view.setInt16(index, pcmBuffer[i] * (0x7FFF * volume), true);
        index += 2;
      }

      this.postMessage({
        command: "end",
        uuid: uuid,
        buffer: wavBuffer,
        gainLevel: gainLevel
      });
      delete jobs[uuid];
      break;
  }
});

