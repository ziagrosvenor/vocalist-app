import React from 'react';
import "./MediaPlayer.scss"
import PlayPause from './PlayPause'
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';

let canvas
const canvasWidth = 200
const canvasHeight = 130

const buttonStyle = {
  width: "100%",
  marginBottom: "1rem"
}

class Playlist extends React.Component {
  render() {
    const { takes, currentTake } = this.props
    return (
      <aside className="media-playlist">
        <ul className="media-playlist-tracks">
          {takes.map((track, i) =>
            <li
              key={i}
              className={`media-playlist-track ${i === currentTake ? 'is-active' : ''}`}
              onTouchTap={() => this.props.selectTake(i)}
            >
              {track.filename}
            </li>
          )}
        </ul>
      </aside>
    )
  }
}

export class ViewRecording extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      hasSaved: false,
      downloaded: false,
      isPreviewing: false,
      pos: 0
    }
  }

  componentWillUnmount() {
    this.props.stopBackingTrack()
    this.stopTakeAudio()
  }

  handleSave = () => {
    this.setState({hasSaved: true})
    this.props.saveFile(this.props.selectedTake)
  }
  stopTakeAudio = () => {
    if (this.takeAudio) {
      this.takeAudio.pause()
      this.takeAudio.currentTime = 0
    }
  }
  toggleTakeAudio = () => {
    if (!this.state.isPreviewing)
      return this.takeAudio.play()

    this.stopTakeAudio()
  }
  togglePreviewing = () => {
    this.setState({
      isPreviewing: !this.state.isPreviewing,
      pos: 0
    })

    this.toggleTakeAudio()
    // this delays the back track to put it in sync with the recording
    this.props.togglePlaying(0.09616)
  }

  handlePosChange = (e) => {
    this.setState({
      pos: e.originalArgs[0]
    });
  }

  render() {
    const {selectedTake, selectTake, takes} = this.props

    if (!takes.length) {
      return (
        <div style={{padding: "1rem"}}>
          <h2 style={{marginBottom: "2rem"}} className="title">You need to record a take first</h2>
          <RaisedButton
            label="Record a take here"
            primary={true}
            style={buttonStyle}
            onTouchTap={this.props.backLink}
          />
        </div>
      )

    }

    const {url, filename} = takes[selectedTake]

    let uploadingProgress

    if (this.props.uploading && this.props.uploadProgress) {
      uploadingProgress = (
        <div>
           <h2 className="title">Uploading</h2>
           <LinearProgress mode="determinate"
             value={this.props.uploadProgress.value}
             min={0}
             max={this.props.uploadProgress.total}
           />
        </div>
      )
    }

    return (
      <div>
        <div style={{padding: "1rem"}}>
          <audio
            ref={(takeAudio) => this.takeAudio = takeAudio}
            src={url}
            controls=""/>
          <div className="media-controls">
            <PlayPause
              togglePlaying={this.togglePreviewing}
              isPlaying={this.state.isPreviewing}
              className="media-control media-control--play-pause"/>
          </div>
          <Playlist
            selectTake={selectTake}
            currentTake={this.props.selectedTake}
            takes={this.props.takes}
          />
        </div>
        <div style={{padding: "0 1rem"}}>
          <RaisedButton
            label={`Upload ${filename}`}
            primary={true}
            style={buttonStyle}
            onTouchTap={this.handleSave}
            disabled={this.state.hasSaved}
          />
          <a
            download={filename}
            href={url}
            onClick={() => this.setState({downloaded: true})}
          >
            <RaisedButton
              label={`Download ${filename}`}
              primary={true}
              style={buttonStyle}
              disabled={this.state.downloaded}
            />
          </a>
          <RaisedButton
            label="Record another take"
            primary={true}
            style={buttonStyle}
            onTouchTap={() => {
              this.props.backLink()
            }}
          />
          {uploadingProgress}
        </div>
      </div>
    )
  }
}
