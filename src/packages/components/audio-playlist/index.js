import React from 'react';
import PlayPause from './PlayPause'
import "./MediaPlayer.scss"

class Playlist extends React.Component {
  render() {
    const { tracks, selectedTrack } = this.props
    return (
      <aside className="media-playlist">
        <ul className="media-playlist-tracks">
          {tracks.map((track, i) =>
            <li
              key={i}
              className={`media-playlist-track ${i === selectedTrack ? 'is-active' : ''}`}
              onTouchTap={() => this.props.selectTrack(i)}
            >
              {track.filename}
            </li>
          )}
        </ul>
      </aside>
    )
  }
}

export class AudioPlaylist extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isPlaying: false,
    }
  }

  componentWillUnmount() {
    this.stopTrack()
  }

  stopTrack = () => {
    console.log(this.takeAudio)
    if (this.takeAudio) {
      this.takeAudio.pause()
      this.takeAudio.currentTime = 0
    }
  }

  startTrack = () => {
    if (!this.state.isPlaying)
      return this.takeAudio.play()
  }

  togglePlaying = () => {
    this.props.onTogglePlaying()
    this.setState({isPlaying: !this.state.isPlaying})
  }

  render() {
    const {selectedTrack, selectTrack, tracks} = this.props
    const {url} = tracks[selectedTrack]

    return (
      <div style={{padding: "1rem"}}>
        <audio
          ref={(takeAudio) => this.takeAudio = takeAudio}
          src={url}
          controls=""/>
        <div className="media-controls">
          <PlayPause
            togglePlaying={this.togglePlaying}
            isPlaying={this.state.isPlaying}
            className="media-control media-control--play-pause"/>
        </div>
        <Playlist
          selectTrack={selectTrack}
          selectedTrack={selectedTrack}
          tracks={tracks}
        />
      </div>
    )
  }
}
