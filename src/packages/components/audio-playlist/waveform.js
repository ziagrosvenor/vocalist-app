import React from 'react';
import {getContext} from '../../audio/audio-context'

const ctx = getContext()

function getWaveformSteps(buffer, width, height) {
  var stepEls = []

  var data = buffer.getChannelData( 0 );
  var step = Math.ceil( data.length / width );
  var amp = height / 2;

  for (var i=0; i < width; i++) {
    var min = 1.0;
    var max = -1.0;
    for (var j=0; j<step; j++) {
      var datum = data[(i*step)+j];
      if (datum < min)
        min = datum;
      if (datum > max)
        max = datum;
    }

    stepEls.push({
      x: i,
      y: (1+min)*amp,
      width: 1,
      height: Math.max(1, (max-min)*amp),
    })
  }

  return stepEls
}

function fetchArrayBuffer(url) {
  return fetch(url)
    .then((response) => response.arrayBuffer())
}

function decodeAudioDataP(arrayBuffer) {
  return new Promise((resolve, reject) => {
    ctx.decodeAudioData(arrayBuffer, resolve)
  })
}

export class Waveform extends React.Component {
  constructor(props) {
    super(props)

    this.state ={
      stepsData: {},
      loading: true
    }
  }

  componentDidMount() {
    this.fetchWaveSteps(this.props.url)
  }

  fetchWaveSteps = (url) => {
    const {width} = this.svgContainer.getBoundingClientRect()
    fetchArrayBuffer(url)
      .then(decodeAudioDataP)
      .then((audioBuffer) => {
        return getWaveformSteps(
          audioBuffer,
          this.props.width || width,
          this.props.height,
        )
      })
      .then((steps) => {
        this.setState({
          stepsData: {
            ...this.state.stepsData,
            [url]: steps
          },
          loading: false
        })
      })
  }

  componentWillReceiveProps(props) {
    if (this.state.stepsData[props.url])
      return

    this.setState({loading: true})
    this.fetchWaveSteps(props.url)
  }

  render() {
    let svgContent

    if (this.state.loading) {
      svgContent = <text x="20" y="40">Loading ...</text>
    } else {
      svgContent = this.state.stepsData[this.props.url]
        .map((stepData, i) => <rect key={i} {...stepData} fill={this.props.color}></rect>)
    }

    return (
      <div
        ref={(svgContainer) => this.svgContainer = svgContainer}
        style={{
          width: "100%",
          height: this.props.height,
        }}
      >
        <svg width="100%">
          <g>{svgContent}</g>
        </svg>
      </div>
    )
  }
}

