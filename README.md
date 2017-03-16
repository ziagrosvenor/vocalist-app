# Vocal Recording / Monitoring

### Web audio nodes
This project aims to minimise monitoring latency
by using a few nodes as possible.

The main piece of processing is the recording and monitoring of the `MediaStream` audio. This source is split using `GainNode`s. One version of the signal is mixed with an `AudioBufferSourceNode` signal and routed to the destination. The `AudioBufferSourceNode` provides a backing track for people to sing over. A second version of the signal is connected to `ScriptProcessorNode` that sends messages directly to a `WebWorker` for conversion of audio into to `wav` audio format. This second signal chain is then routed into the volume mixer however its volume is set to zero before it is connected.

```
// The web worker checks for low or peaked gains
data.gainLevel = ["PEAKED_GAIN", "LOW_GAIN", "MID_GAIN"]
```

### NPM scripts
This project is managed with NPM scripts.

```
// Launch dev server
npm start

// bundle source code and copy to the dist directory
npm run dist
```

### UI Components

Much of the UI is built with `react-material-ui`
