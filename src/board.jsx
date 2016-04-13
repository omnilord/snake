/*
var React = require('react');
var Row = require('./row');
*/
import React from 'react';
import Row from './row';

class Board extends React.Component {
  render() {
    return (
      <table>
        <tbody>
        {Array(this.props.gridsize).fill().map((val, row) => <Row row={row} cols={this.props.gridsize} cls="" apple={this.props.apple} worm={this.props.worm} />)}
        </tbody>
      </table>
    );
  }
}

export default Board;
