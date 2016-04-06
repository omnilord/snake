/*
var React = require('react');
var Cell = require('./cell');
*/
import React from 'react';
import Cell from './cell';

class Row extends React.Component {
  render() {
    return (
      <tr key={"row-"+this.props.row} data-y={this.props.row}>
        {Array(this.props.cols).fill().map((val, col) => <Cell x={col} y={this.props.row} cls={this.props.cls} apple={this.props.apple} worm={this.props.worm} />)}
      </tr>
    );
  }
}

export default Row;
