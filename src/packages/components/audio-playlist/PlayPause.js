import React, { Component, PropTypes } from 'react'


class PlayPause extends Component {
  render() {
    const {  isPlaying , className } = this.props
    return (
      <svg
        role="button"
        width="36px"
        height="36px"
        viewBox="0 0 36 36"
        className={className}
        onClick={this.props.togglePlaying}
      >
      	<circle fill="rgb(103, 58, 183)" cx="18" cy="18" r="18"/>

            { isPlaying &&
              <g key="pause" style={{ transformOrigin: '0% 50%' }}>
        	      <rect x="12" y="11" fill="#CDD7DB" width="4" height="14"/>
        	      <rect x="20" y="11" fill="#CDD7DB" width="4" height="14"/>
              </g>
            }
            { !isPlaying &&
              <polygon
                key="play"
                fill="#CDD7DB"
                points="14,11 26,18 14,25"
                style={{ transformOrigin: '100% 50%' }}
              />
            }
      </svg>
    )
  }
}

export default PlayPause
