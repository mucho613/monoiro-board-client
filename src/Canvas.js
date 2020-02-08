import React from 'react';
import './Canvas.css';

import DestinationCanvasPiece from './DestinationCanvasPiece';
// import TemporaryCanvas from './TemporaryCanvas'

class Canvas extends React.Component {
  canvasWidth = 2000;
  canvasHeight = 2000;

  historyLength = 10;

  initialize = image => {
  }

  strokeStart = (x, y, force) => {
    const thickness = this.getThickness(force);
    this.actionStart();
    this.actionUpdate({ x: x, y: y, thickness: thickness });
  }

  strokeMove = (x, y, force) => {
    const thickness = this.getThickness(force);
    if(thickness !== 0) {
      this.actionUpdate({ x: x, y: y, thickness: thickness });
      this.updateTemporaryLayer();
    }
  }

  strokeEnd = (x, y, force) => {
    const thickness = this.getThickness(force);
    this.actionUpdate({ x: x, y: y, thickness: thickness });
    this.actionEnd();
  }

  update = queue => {
    for(let i = 0; i < queue.length; i++) {
      queue[i] 
    }
  }

  getThickness = force => this.props.selectedTool === 1
    ? this.props.penThicknessCoefficient * force
    : this.props.eraserThicknessCoefficient * force;

  shouldComponentUpdate = () => false;

  render() {
    return (
      <div>
        <DestinationCanvasPiece width={this.canvasWidth} height={this.canvasHeight} />
      </div>
    );
  }
}

export default Canvas;
