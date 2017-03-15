require('normalize.css/normalize.css');
require('styles/App.css');

import React from 'react';
import {microphone} from '../audio/microphone'
import {audioSource} from '../audio/audio-source'
import {mixer} from '../audio/mixer'
require("react-tap-event-plugin")()

import RaisedButton from 'material-ui/RaisedButton';
import Slider from 'material-ui/Slider';
import {Mic} from "./Microphone.js"
import {NavBar} from "./NavBar.js"
import {BottomNav} from "./BottomNav"

let ctx

const config = {
  url: '/assets/instrumentals/hendrix.mp3'
}

const mixerConfig = {value: 50, max: 100}

class AppComponent extends React.Component {
  constructor(props) {
    super(props)
    ctx = new AudioContext()
    this.toggleRecord = this.toggleRecord.bind(this)
    this.togglePlaying = this.togglePlaying.bind(this)
    this.handleMixChange = this.handleMixChange.bind(this)
    this.state = {
      loading: true,
      recording: false,
      playing: false,
      mix: mixerConfig.value
    }
  }
  componentDidMount() {
    Promise.all([microphone(ctx), audioSource(ctx, config)])
      .then((values) => {
        this.mic = values[0]
        this.audioSource = values[1]
        this.mixer = mixer(ctx, mixerConfig, this.mic.node, this.audioSource.node)

        this.mixer.node.connect(ctx.destination)
        this.setState({loading: false})
      })
  }
  togglePlaying() {
    if (this.state.playing) {
      this.audioSource.stop()
      this.setState({playing: false})
      return
    }

    this.audioSource.play()
    this.setState({playing: true})
  }
  handleMixChange(value) {
   this.setState({mix: value})
   this.mixer.updateMix(value)
  }
  toggleRecord() {
    if (this.state.recording) {
      this.setState({recording: false})
      return this.mic.stopRecording()
    }

    this.mic.startRecording()
    this.setState({recording: true})
  }
  render() {
    const buttonText = this.state.recording ? 'Stop recording' : 'Record'
    const audioSourceButtonText = this.state.playing ? 'Stop' : 'Loop'

    let component

    if (this.state.loading) {
      component = (
        <div>Loading...</div>
      )
    }

    const playButton = (
      <RaisedButton
        onTouchTap={this.togglePlaying}
        label={audioSourceButtonText}
        primary={true}
      />
    )

    component = (
      <div className='wrapper'>
        <NavBar/>
        <Mic toggleRecord={this.toggleRecord}/>
        <BottomNav
          actionButton={playButton}
        />
        <div style={{padding: "0 1rem"}}>
          <h3 className="title">Microphone / Track Volume Mix</h3>
          <Slider
            min={0}
            max={100}
            value={this.state.mix}
            onChange={(e, v) => this.handleMixChange(v)}
          />
        </div>
      </div>
    );

    return component
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
