/*
var React = require('react');
var TopBar = require('./topbar');
var Board = require('./board');
*/
import React from 'react';
import TopBar from './topbar';
import Board from './board';
import $ from 'jquery';

// Starting values, once Game is rendered, these values do nothing until the game restarts
var GRIDSIZE = 21,
    heartrate = 500;

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }


  getInitialState() {
    return {
      active: false,
      worm: { vector: [0, 0], length: 3, segments: [{ x: Math.floor(GRIDSIZE / 2), y: Math.floor(GRIDSIZE / 2) }] },
      apple: null,
      gridsize: GRIDSIZE,
      board: Array(GRIDSIZE).fill().map((v, i) => ({ row: i, cols: Array(GRIDSIZE).fill().map((v, j) => ({ row: i, col: j })) })),
      heartrate: heartrate,
      heartdelta: Math.ceil((heartrate - 15) / (GRIDSIZE * GRIDSIZE))
    }
  }


  reset() {
    this.setState(this.getInitialState());
  }


  apple() {
    var coords;
    do {
      coords = { x: Math.floor(Math.random() * GRIDSIZE), y: Math.floor(Math.random() * GRIDSIZE)};
    } while (this.state.worm.segments.filter(function(el) { return coords.x == el.x && coords.y == el.y; }).length);
    this.state.apple = coords;
  }


  go(vector) {
    if (Math.abs(vector[0]) === Math.abs(this.state.worm.vector[0]) && Math.abs(vector[1]) === Math.abs(this.state.worm.vector[1])) {
      return;
    }
    this.state.worm.vector = vector;
    this.setState({ worm: this.state.worm });

    if (!this.state.active) {
      this.apple();
      this.setState({
        active: true,
        apple: this.state.apple,
        heartbeat: setTimeout(this.move.bind(this), this.state.heartrate)
      });
    }
  }


  move() {
    var head = this.state.worm.segments[0],
        next = { x: head.x + this.state.worm.vector[0], y: head.y + this.state.worm.vector[1] };

    if (next.x < 0 || next.y < 0 || next.x >= GRIDSIZE || next.y >= GRIDSIZE
        || this.state.worm.segments.filter(function(el) { return next.x == el.x && next.y == el.y; }).length) {
      clearTimeout(this.state.heartbeat);
      this.setState({ heartbeat: null });
      alert('Game Over.');
      this.reset();
    } else {
      if (next.x == this.state.apple.x && next.y == this.state.apple.y) {
        this.state.heartrate = Math.max(15, this.state.heartrate - this.state.heartdelta);
        this.state.worm.length++;
        this.apple();
      }
      this.state.worm.segments.unshift(next);
      if (this.state.worm.segments.length > this.state.worm.length) {
        this.state.worm.segments.pop();
      }
      this.setState({
        worm: this.state.worm,
        apple: this.state.apple,
        heartrate: this.state.heartrate,
        heartbeat: setTimeout(this.move.bind(this), this.state.heartrate)
      });
    }
  }


  componentDidMount() {
    $(document).on("keydown", (ev) => {
      switch (ev.which) {
        // Left-Arrow, A key
        case 37: case 65: this.go([-1, 0]); break;
        // Up-Arrow, W key
        case 38: case 87: this.go([0, -1]); break;
        // Right-Arrow, D key
        case 39: case 68: this.go([1, 0]); break;
        // Down-Arrow, S key
        case 40: case 83: this.go([0, 1]); break;
        default: return;
      }
    });
  }


  componentWillUnmount() {
    $(document).off('keydown');
  }


  render() {
    return (
      <div id="main" key="main">
        <TopBar key="top" active={this.state.active} apples={this.state.worm.length - 3} />
        <Board key="board" {...this.state} />
      </div>
    );
  }
}

export default Game;
