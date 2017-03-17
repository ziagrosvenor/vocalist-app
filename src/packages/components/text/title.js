import React from 'react'
import './title.scss'

export const Title = (props) => {
  return (
    <h3
      style={props.style}
      className='title'
    >{props.children}</h3>
  )
}
