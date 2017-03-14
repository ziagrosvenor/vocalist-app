var UserMediaRecording = require("./user_media_recording");

function uuid() {
  var d = (window.performance && window.performance.now && window.performance.now()) ||
          (Date.now && Date.now()) ||
          new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === "x" ? r : (r&0x7|0x8)).toString(16);
  });
  return uuid;
}

function UserMediaRecorder(stream, worker, ctx, input, config) {
  return new UserMediaRecording(uuid(), stream, ctx, input, worker, config);
}

module.exports = UserMediaRecorder;
