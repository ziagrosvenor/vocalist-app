import React from 'react';
import {Mic} from './components/microphone'
import {Slider} from '../../../packages/components/slider'
import {Title} from '../../../packages/components/text/title'

export const MicrophoneBooth = (props) => {
  return (
    <div>
      <Mic
        stopRecording={props.stopRecording}
        startRecording={props.startRecording}
      />
      <div style={{padding: '0 1rem'}}>
        <Title>Microphone monitoring volume, use with headphones</Title>
        <Slider
          onChange={props.onMicrophoneMixChange}
          value={props.microphoneMix}
        />
      </div>
    </div>
  );
}
