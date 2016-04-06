// var React = require('react');
import React from 'react';

class Cell extends React.Component {
  render() {
    var cls = (this.props.apple && this.props.apple.x == this.props.x && this.props.apple.y == this.props.y)
            ? 'apple'
            : (this.props.worm.segments.filter(function (el) {
                return this.x == el.x && this.y == el.y;
              }, this.props).length ? 'worm' : '');
    return (
      <td key={'cell-'+this.props.x+'x'+this.props.y} data-x={this.props.x} data-y={this.props.y} className={cls} />
    );
  }
}

export default Cell;
