import React from 'react';
import "./MediaPlayer.scss"
import PlayPause from './PlayPause'
import MuteUnmute from './MuteUnmute'
import Wavesurfer from 'react-wavesurfer';
import { Media, Player, controls, utils } from 'react-media-player'
const { CurrentTime, Progress, SeekBar, Duration, Volume, Fullscreen } = controls
import RaisedButton from 'material-ui/RaisedButton';

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
        <header className="media-playlist-header">
          <h3 className="media-playlist-title">Playlist</h3>
        </header>
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
      isPlaying: false,
      pos: 0
    }
  }

  handleSave = () => {
    this.setState({hasSaved: true})
    this.props.saveFile(this.props.selectedTake)
  }
  togglePlaying = () => {
    this.setState({isPlaying: !this.state.isPlaying})
  }

  handlePosChange = (e) => {
    this.setState({
      pos: e.originalArgs[0]
    });
  }

  render() {
    const {selectedTake, selectTake, takes} = this.props
    const {url, filename} = takes[selectedTake]

    return (
      <div>
        <div style={{padding: "1rem"}}>
          <Wavesurfer
            audioFile={url}
            pos={this.state.pos}
            onPosChange={this.handlePosChange}
            playing={this.state.isPlaying}
          />
          <div className="media-controls">
            <PlayPause
              togglePlaying={this.togglePlaying}
              isPlaying={this.state.isPlaying}
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
            onTouchTap={this.props.backLink}
          />
        </div>
      </div>
    )
  }
}
