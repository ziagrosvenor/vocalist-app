require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import {microphone} from '../audio/microphone'
import {audioSource} from '../audio/audio-source'
import {mixer} from '../audio/mixer'

import {saveWav} from "../lib/aws"

import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import Snackbar from 'material-ui/Snackbar';
import Slider from 'material-ui/Slider';
import {Mic} from "./Microphone.js"
import {NavBar} from "./NavBar.js"
import {BottomNav} from "./BottomNav"
import {ViewRecording} from "./ViewRecording"

let ctx

const config = {
  url: '/assets/instrumentals/hendrix.mp3'
}

const mixerConfig = {value: 100, max: 100}

class AppComponent extends React.Component {
  constructor(props) {
    super(props)
    ctx = new AudioContext({latencyHint: 0.01})
    this.toggleRecord = this.toggleRecord.bind(this)
    this.togglePlaying = this.togglePlaying.bind(this)
    this.handleMixChange = this.handleMixChange.bind(this)
    this.state = {
      loading: true,
      recording: false,
      playing: false,
      uploading: false,
      snackBarOpen: false,
      mix: mixerConfig.value,
      takes: [],
      selectedTake: 0
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
  stopRecording = () => {
    this.setState({recording: false})
    this.mic.stopRecording((data) => {
      const view = new DataView(data.buffer);
      var blob = new Blob([view], {type: data.type});

      const snackBarOptions = {
        message: "Success",
        action: "View recording",
        onActionTouchTap: this.handleRecordingComplete
      }

      const newTake = {
        blob: blob,
        buffer: data.buffer,
        url: URL.createObjectURL(blob),
        filename: "my-take" + Date.now() + ".wav"
      }

      this.setState({
        takes: this.state.takes.concat([newTake]),
        snackBarOpen: true,
        snackBarOptions
      })

    })
  }
  selectTake = (id) => {
    this.setState({selectedTake: id})
  }

  saveFileToS3 = (id) => {
    this.setState({uploading: true})
    const take = this.state.takes[id]

    saveWav(take.blob, take.filename, console.log)
      .then(() => {
        const snackBarOptions = {
          message: "Success",
          action: "File location",
          onActionTouchTap: this.handleSavingComplete
        }
        this.setState({
          uploading: false,
          snackBarOptions,
          snackBarOpen: true
        })
      })
      .catch((err) => {
        console.error(err)
        this.setState({uploading: false})
      })
  }
  startRecording = () => {
    this.mic.startRecording()
    this.setState({recording: true})
  }
  toggleRecord() {
    this.state.recording ? this.stopRecording()
      : this.startRecording()
  }
  handleRequestClose = () => {
    this.setState({
      snackBarOpen: false,
    });
  };
  handleRecordingComplete = () => {
    this.setState({
      route: "manage_takes",
      snackBarOpen: false,
    });
  };
  transitionTo = (route) => {
    this.setState({route});
  };
  handleSavingComplete = () => {
    this.setState({
      snackBarOpen: false,
    });
  };
  render() {
    const audioSourceButtonText = this.state.playing ? 'Stop' : 'Loop'

    let component

    if (this.state.loading) {
      return (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          height: "100vh",
          width: "100vw"
        }}>
          <CircularProgress size={80} thickness={5} />
          <h2
            style={{width: "100%", textAlign: "center", marginTop: "2rem"}}
            className="title">Loading ...</h2>
        </div>
      )
    }

    const playButton = (
      <RaisedButton
        onTouchTap={this.togglePlaying}
        label={audioSourceButtonText}
        primary={true}
      />
    )

    if (this.state.route === "manage_takes") {
      component = (
        <ViewRecording
          takes={this.state.takes}
          selectedTake={this.state.selectedTake}
          selectTake={this.selectTake}
          saveFile={this.saveFileToS3}
          uploading={this.state.uploading}
          backLink={() => this.setState({route: "index"})}
        />
      )
    } else {
      component = (
        <div>
          <Mic toggleRecord={this.toggleRecord}/>
          <div style={{padding: "0 1rem"}}>
            <h3 className="title">Microphone / Track Volume Mix</h3>
            <Slider
              min={0}
              max={100}
              value={this.state.mix}
              onChange={(e, v) => this.handleMixChange(v)}
              sliderStyle={{padding: "2rem 0"}}
            />
          </div>
        </div>
      );
    }


    return (
      <div className='wrapper'>
        <NavBar
          transitionTo={this.transitionTo}
          route={this.state.route}
        />
        {component}
        <BottomNav
          actionButton={playButton}
        />
        <Snackbar
          open={this.state.snackBarOpen}
          message=""
          autoHideDuration={5000}
          {...this.state.snackBarOptions}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    )
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
