import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
import {Title} from '../../../packages/components/text/title'
import {AudioPlaylist} from '../../../packages/components/audio-playlist'

const buttonStyle = {
  width: "100%",
  marginBottom: "1rem"
}

function NoDataMessage(props) {
  return (
    <div style={{padding: "1rem"}}>
      <Title
        style={{marginBottom: "2rem"}}
      >You need to record a take first</Title>
      <RaisedButton
        label="Record a take here"
        primary={true}
        style={buttonStyle}
        onTouchTap={props.backLink}
      />
    </div>
  )
}

function UploadingProgress(props) {
  return (
    <div>
      <Title>Uploading</Title>
      <LinearProgress mode="determinate"
        value={props.value}
        min={0}
        max={props.total}
      />
</div>
  )
}

export class ManageTakes extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      hasSaved: false,
      downloaded: false,
      isPreviewing: false,
    }
  }

  componentWillUnmount() {
    this.props.stopBackingTrack()
  }

  handleSave = () => {
    this.setState({hasSaved: true})
    this.props.saveFile(this.props.selectedTake)
  }

  togglePreviewing = () => {
    if (!this.state.isPreviewing) {
      this.takesPlayer.startTrack()
      // this delays the backing track to put it in sync with the recording
      this.props.togglePlaying(0.09616)
    } else {
      this.takesPlayer.stopTrack()
      this.props.togglePlaying()
    }

    this.setState({
      isPreviewing: !this.state.isPreviewing,
    })
  }

  render() {
    const {selectedTake, selectTake, takes} = this.props

    if (!takes.length) {
      return (<NoDataMessage backLink={this.props.backLink}/>)
    }

    const {url, filename} = takes[selectedTake]
    let uploadingProgress

    if (this.props.uploading && this.props.uploadProgress) {
      uploadingProgress = (
        <UploadingProgress
          value={this.props.uploadProgress.value}
          max={this.props.uploadProgress.max}
        />
      )
    }

    return (
      <div>
        <AudioPlaylist
          tracks={takes}
          selectedTrack={selectedTake}
          selectTrack={selectTake}
          ref={(takesPlayer) => this.takesPlayer = takesPlayer}
          onTogglePlaying={this.togglePreviewing}
        />
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
