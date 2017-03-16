require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import Snackbar from 'material-ui/Snackbar';

import { themeProvider } from '../packages/theme/theme-provider'

import {NavBar} from '../packages/components/nav/NavBar'
import {BottomNav} from '../packages/components/nav/BottomNav'
import {Spinner} from '../packages/components/spinner'

import {ManageTakes} from './pages/manage-takes'
import {MicrophoneBooth} from './pages/microphone-booth'

import {microphone} from '../packages/audio/microphone'
import {audioSource} from '../packages/audio/audio-source'
import {mixer} from '../packages/audio/mixer'
import {saveWav} from '../packages/lib/aws'

import {copyTextToClipboard} from '../packages/lib/copy-to-clipboard'

let ctx

const config = {
  url: '/assets/instrumentals/backing.ogg'
}

const snackBarOptionsMap = {
  LOW_GAIN: {
    message: 'Please sing louder or move closer to the microphone'
  },
  PEAKED_GAIN: {
    message: 'Please move further away from the microphone'
  }
}

const mixerConfig = {value: 0, max: 100}

class AppComponent extends React.Component {
  constructor(props) {
    super(props)

    try {
      ctx = new AudioContext({latencyHint: 0.01})
    } catch (e) {
      ctx = new AudioContext()
    }

    this.togglePlaying = this.togglePlaying.bind(this)
    this.handleMixChange = this.handleMixChange.bind(this)
    this.state = {
      loading: true,
      recording: false,
      playing: false,
      uploading: false,
      snackBarOpen: false,
      microphoneMix: mixerConfig.value,
      takes: [],
      selectedTake: 0
    }
  }
  componentDidMount() {
    this.setState({
      snackBarOpen: true,
      snackBarOptions: {
        message: "This app works in Chrome browser on desktop and some Android devices"
      }
    })
    Promise.all([microphone(ctx), audioSource(ctx, config)])
      .then((values) => {
        this.mic = values[0]
        this.audioSource = values[1]
        this.mixer = mixer(ctx, mixerConfig, this.audioSource.node, this.mic.node)

        this.mixer.node.connect(ctx.destination)
        this.setState({loading: false})
      })
  }
  stopBackingTrack = () => {
    if (this.audioSource.source && this.audioSource.stop) {
      this.audioSource.stop()
    }
  }
  togglePlaying(startTime = 0) {
    if (this.audioSource.source && this.audioSource.stop) {
      return this.stopBackingTrack()
    }

    this.audioSource.play(startTime)
  }
  handleMixChange(value) {
   this.setState({microphoneMix: value})
   this.mixer.updateMix(value)
  }
  startRecording = () => {
    this.audioSource.play(0)
    this.setState({snackBarOpen: false})
    this.mic.startRecording()
    this.setState({recording: true})
  }
  stopRecording = () => {
    if (!this.state.recording) {
      return
    }

    this.stopBackingTrack()
    this.setState({recording: false})

    this.mic.stopRecording((data) => {
      let snackBarOptions

      if (data.gainLevel === "LOW_GAIN" || data.gainLevel === "PEAKED_GAIN") {
        return this.setState({snackBarOpen: true, snackBarOptions: snackBarOptionsMap[data.gainLevel]})
      }

      const successSnackBar = {
        message: "Success",
        action: "Manage take",
        onActionTouchTap: this.handleRecordingComplete
      }

      const view = new DataView(data.buffer);
      var blob = new Blob([view], {type: data.type});

      const newTake = {
        blob: blob,
        buffer: data.buffer,
        url: URL.createObjectURL(blob),
        filename: "my-take" + Date.now() + ".wav",
      }

      const newTakes = this.state.takes.concat([newTake])

      this.setState({
        takes: newTakes,
        snackBarOpen: true,
        snackBarOptions: successSnackBar,
        selectedTake: newTakes.length - 1
      })
    })
  }
  selectTake = (id) => {
    this.setState({selectedTake: id})
  }

  saveFileToS3 = (id) => {
    this.setState({uploading: true})
    const take = this.state.takes[id]

    saveWav(take.blob, take.filename, (progress) => { this.setState({uploadProgress: {value: progress.loaded, total: progress.total}})})
      .then(() => {
        const stemLocation = `https://vocalappstems.s3.amazonaws.com/${take.filename}`

        const snackBarOptions = {
          message: `Success`,
          action: "Copy URL to clipboard",
          onActionTouchTap: () => copyTextToClipboard(stemLocation)
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
    this.stopBackingTrack()
    this.stopRecording()
    this.setState({route});
  };
  handleSavingComplete = () => {
    this.setState({
      snackBarOpen: false,
    });
  };
  render() {
    let component

    if (this.state.loading) {
      <Spinner
        snackBarOpen={this.state.snackBarOpen}
        snackBarOptions={this.state.snackBarOptions}
        handleRequestClose={this.handleRequestClose}
      />
    }

    if (this.state.route === 'manage_takes') {
      component = (
        <ManageTakes
          takes={this.state.takes}
          selectedTake={this.state.selectedTake}
          selectTake={this.selectTake}
          saveFile={this.saveFileToS3}
          uploading={this.state.uploading}
          togglePlaying={this.togglePlaying}
          stopBackingTrack={this.stopBackingTrack}
          uploadProgress={this.state.uploadProgress}
          backLink={() => this.setState({route: 'index'})}
        />
      )
    } else {
      component = (
        <MicrophoneBooth
          startRecording={this.startRecording}
          stopRecording={this.stopRecording}
          microphoneMix={this.state.microphoneMix}
          onMicrophoneMixChange={this.handleMixChange}
        />
      )
    }

    return (
      <div className='wrapper'>
        <NavBar
          transitionTo={this.transitionTo}
          route={this.state.route}
        />
        {component}
        <BottomNav/>
        <Snackbar
          open={this.state.snackBarOpen}
          message=""
          autoHideDuration={10000}
          {...this.state.snackBarOptions}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    )
  }
}

export const App = themeProvider(AppComponent)
