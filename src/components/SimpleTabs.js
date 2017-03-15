import React from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';

export class SimpleTabs extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.defaultValue
    };
  }

  handleChange = (value) => {
    this.setState({
      value: value,
    });
  };

  render() {
    const tabs = this.props.tabs.map((tab, i) => {
      <Tab label={tab.label} key={i} value={tab.value}>
        fooo
        {tab.component}
      </Tab>
    })
    return (
      <Tabs
        value={this.state.value}
        onChange={this.handleChange}
      >
        {tabs}
      </Tabs>
    );
  }
}

