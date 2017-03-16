import React from 'react'

export const Title = (props) => {
  return (
    <h3
      style={props.style}
      className='title'
    >{props.children}</h3>
  )
}
