function UserMediaRecording(uuid, stream, worker, audioContext, input) {
  this.recording = false;
  this.uuid = uuid;
  this.stream = stream;
  this.input = input
  this.output = audioContext.createGain()
  this.audioContext = audioContext;
  this.worker = worker;

  // This very large buffer size does not effect
  // latency as the audio node output is muted
  // the signal is split before connecting to
  // script processor node as it is known to
  // cause latency
  this.config = {
    mono: true,
    bufferSize: 16384,
  }
  this.config.channels = this.config.mono ? 1 : 2;
  this.endRecordingCallback = function() {};
  this.type = "";

  this._onAudioProcess = this._onAudioProcess.bind(this);
  this.worker.addEventListener("message", this._handleWorkerMessage.bind(this));
}

UserMediaRecording.prototype.dispose = function() {
  this.input.disconnect(this.scriptProcessor)
  this.scriptProcessor.disconnect(this.output)
  this.scriptProcessor = null
}

UserMediaRecording.prototype.startRecording = function() {
  if (this.recording) {
    throw new Error("Already recording");
  }

  this.recording = true;

  this.scriptProcessor = this.audioContext.createScriptProcessor(this.config.bufferSize, this.config.channels, this.config.channels);
  this.input.connect(this.scriptProcessor);
  this.scriptProcessor.connect(this.output);

  this.scriptProcessor.addEventListener("audioprocess", this._onAudioProcess);

  this.worker.postMessage({
    command: "init",
    uuid: this.uuid,
    config: {
      samplerate: this.audioContext.sampleRate,
      channels: this.config.channels,
      bitrate: this.config.bitrate
    }
  });

  return this
};

UserMediaRecording.prototype.stopRecording = function(callback) {
  if (!this.recording) {
    throw new Error("Not recording");
  }

  this.recording = false;
  this.endRecordingCallback = callback || this.endRecordingCallback;

  this.worker.postMessage({
    command: "end",
    uuid: this.uuid
  });
};

UserMediaRecording.prototype._onAudioProcess = function(evt) {
  var audioData = this._getAudioData(evt.inputBuffer);

  if (!this.recording) return;
  this.worker.postMessage({
    command: "encode",
    uuid: this.uuid,
    buffer: audioData
  });
};

UserMediaRecording.prototype._getAudioData = function(inputBuffer) {
  var channelLeft, channelRight;
  if (this.stream.ended) return [];
  channelLeft = new Float32Array(inputBuffer.getChannelData(0))
  return [channelLeft]
};

UserMediaRecording.prototype._handleWorkerMessage = function(evt) {
  var data = evt.data,
      uuid = data.uuid;

  if (uuid !== this.uuid) {
    return;
  }

  switch (data.command) {
  case "init":
    this.type = data.type;
    break;
  case "end":
    data.type = this.type
    try {
      try {
        this.endRecordingCallback(data);
      } catch(e) {
        // don't call back twice
        throw e;
      }
    } catch (e) {
      this.endRecordingCallback(null);
      throw e;
    }
    break;
  }
};

module.exports = UserMediaRecording;
