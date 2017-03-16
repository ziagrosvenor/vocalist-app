import React from 'react';
import {default as MuiSlider} from 'material-ui/Slider';

const sliderStyle = {padding: '2rem 0'}

export const Slider = (props) => {
  return (
    <MuiSlider
      min={0}
      max={100}
      value={props.value}
      onChange={(e, v) => props.onChange(v)}
      sliderStyle={sliderStyle}
    />
  )
}
