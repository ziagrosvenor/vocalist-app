import React from 'react';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';

export const NavBar = (props) => {
  let navButton

  if (props.route === "manage_takes") {
    navButton =
      <FlatButton
        label="Record Take"
        onTouchTap={() => props.transitionTo("index")}
      />
  } else {
    navButton =
      <FlatButton
        label="Manage Takes"
        onTouchTap={() => props.transitionTo("manage_takes")}
      />
  }

  return (
    <AppBar
      title="Vocalist App"
      iconElementLeft={(<span></span>)}
      iconElementRight={navButton}
    />
  )
}
