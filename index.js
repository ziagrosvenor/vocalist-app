var express = require('express');
var lame = require('lame')
var fs = require('fs')
var app = express();
var expressWs = require('express-ws')(app);
var wav = require('wav');

var reader = new wav.Reader();

var encoder = new lame.Encoder({
  // input
  channels: 1,        // 2 channels (left and right)
  bitDepth: 16,       // 16-bit samples
  sampleRate: 44100,  // 44,100 Hz sample rate

  // output
  bitRate: 320,
  outSampleRate: 44100,
  mode: lame.MONO // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO
});


app.get('/', function(req, res, next){
  res.end();
});

const job = {
  buffers: [],
  length: 0,
}

app.ws('/', function(ws, req) {
  ws.on('message', function(data) {
    job.buffers.push(data)
    job.length += data.length
  });
  ws.on('close', function() {
    const data = encodeWav()

    typeof data

    fs.writeFileSync(__dirname + "/test.wav", new Buffer(data, "base64"))
  });
});

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

function encodeWav() {
  var pcmBuffer = mergeBuffers(job.buffers, job.length)
  // RIFF chunk descriptor
  var wavBuffer = new ArrayBuffer(44 + pcmBuffer.length * 2);
  var view = new DataView(wavBuffer);
  writeUTFBytes(view, 0, "RIFF");
  view.setUint32(4, 44 + pcmBuffer.length * 2, true);
  writeUTFBytes(view, 8, 'WAVE');

  // FMT sub-chunk
  writeUTFBytes(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);

  view.setUint16(22, 2, true); // one channel
  view.setUint32(24, 44100, true);
  view.setUint32(28, 44100 * 4, true);
  view.setUint16(32, 4, true);
  view.setUint16(34, 16, true);

  // data sub-chunk
  writeUTFBytes(view, 36, 'data');
  view.setUint32(40, pcmBuffer.length * 2, true);

  // PCM samples
  var lng = pcmBuffer.length;
  var index = 44;
  volume = 1;
  for (var i = 0; i < lng; i++) {
    view.setInt16(index, pcmBuffer[i] * (0x7FFF * volume), true);
    index += 2;
  }

  return wavBuffer
}



app.listen(3000);

