import React from 'react'
import './Microphone.scss'

var close = function() {
};

const micStyle = {
  fill: 'rgba(0,0,0,0.2)',
  transform: 'scale(4)'
}

export class Mic extends React.Component {
  constructor(props) {
    super(props)
    this.handleTransitionEnd = this.handleTransitionEnd.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)

    this.state = {
     active: false,
    }
  }
  componentDidMount() {
    const button = this.svgButton
    var vw = window.innerWidth
    var vh = window.innerHeight
    var bw = button.clientWidth
    var bh = button.clientHeight

    this.setState({vw, vh, bw, bh})
  }
  handleClose() {
    this.props.toggleRecord()
    this.setState({
      cloneStyle: {},
      micStyle: {},
      active: false,
      isRecording: false
    });
  }
  handleTransitionEnd() {
    if (this.state.isRecording)
      this.setState({active: true})
  }
  handleOpen() {
    this.props.toggleRecord()
    const {vh, vw, bw, bh} = this.state
    let s

    if (vw > vh) {
      s = vw / bw * 1.5;
    } else {
      s = vh / bh * 1.5;
    }
    var scale = 'scale(' + s + ') translate(-50%,-50%)';

    this.setState({
      isRecording: true,
      cloneStyle: {transform: scale},
      micStyle
    });
  }
  render() {
    let activeWrapperClassName = 'active-wrapper'

    if (this.state.active)
      activeWrapperClassName += ' active'

    return (
      <div className="button-wrapper">
        <div
          className="button"
          style={this.state.cloneStyle}
        />
        <div
          className="button"
          onTransitionEnd={this.handleTransitionEnd}
          onTouchTap={this.handleOpen}
        >
          <svg className="button-svg"
            style={this.state.micStyle}
            ref={(button) => { this.svgButton = button; }}
            viewBox="0 0 24 24">
            <path d="M12 15c1.66 0 2.99-1.34 2.99-3l.01-6c0-1.66-1.34-3-3-3s-3 1.34-3 3v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1s-5.3-2.1-5.3-5.1h-1.7c0 3.42 2.72 6.23 6 6.72v3.28h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            <path d="M0 0h24v24h-24z" fill="none"/>
          </svg>
        </div>

        <div className={activeWrapperClassName}>
          <div
            onTouchTap={this.handleClose}
            className="stop-button">
            <svg className="stop-button-svg" viewBox="0 0 24 24">
              <path d="M0 0h24v24H0z" fill="none"/>
              <path d="M6 6h12v12H6z"/>
            </svg>
          </div>
        </div>
      </div>
    )
  }
}