import 'core-js/fn/object/assign';
import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './app';
require('react-tap-event-plugin')()

window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.URL = window.URL || window.webkitURL;

// Render the main component into the dom
ReactDOM.render(<App />, document.getElementById('app'));
