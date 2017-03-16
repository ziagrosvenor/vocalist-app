import React from 'react';
import CircularProgress from 'material-ui/CircularProgress';
import Snackbar from 'material-ui/Snackbar';
import {Title} from '../text/title'

const constainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  height: '100vh',
  width: '100vw'
}

const loadingTextStyle = {
  width: '100%',
  textAlign: 'center',
  marginTop: '2rem'
}

export const Spinner = (props) => {
  return (
    <div style={constainerStyle}>
      <CircularProgress size={80} thickness={5} />
      <Title style={loadingTextStyle}>Loading ...</Title>
      <Snackbar
        open={props.snackBarOpen}
        message=""
        autoHideDuration={8000}
        {...props.snackBarOptions}
        onRequestClose={props.handleRequestClose}
      />
    </div>
  )

}
