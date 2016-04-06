//var React = require('react');
import React from 'react';

class TopBar extends React.Component {
  render() {
    return (
      <div id="top">
        Welcome to Snake on ReactJS!
        <span style={{ marginLeft: '10px', fontSize: '8px', display: this.props.active ? 'none' : 'inline' }}>
          (Press an arrow key or a traditional gaming directional key (W, A, S, D) to start...)
        </span>
        <span style={{ marginLeft: '10px', display: this.props.active ? 'inline' : 'none' }}>
          APPLES EATEN: {this.props.apples}
        </span>
      </div>
    );
  }
}

export default TopBar;
