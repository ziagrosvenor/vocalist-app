import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {
  deepPurple500, deepPurple700,
  grey100, grey200, grey300, grey400, grey500,
  white, darkBlack, fullBlack,
} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';


const theme = getMuiTheme({
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: deepPurple500,
    primary2Color: deepPurple700,
    primary3Color: grey400,
    accent1Color: grey200,
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    disabledColor: darkBlack,
    pickerHeaderColor: deepPurple500,
    clockCircleColor: darkBlack,
    shadowColor: fullBlack
  }
})

export const themeProvider = (App) => (
  () => (
    <MuiThemeProvider muiTheme={theme}>
      <App/>
    </MuiThemeProvider>
  )
);
