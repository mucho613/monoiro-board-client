import React from 'react';
import './Canvas.css';

import DestinationCanvasPiece from './DestinationCanvasPiece';

class Canvas extends React.Component {
  canvasWidth = 2048;
  canvasHeight = 2048;

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
    this.updateTemporaryLayer();
  }

  update = queue => {
    this.refs.destinationCanvasPiece.clear();
    for(let i = 0; i < queue.length; i++) {
      if(queue[i].isActive) this.refs.destinationCanvasPiece.commit(queue[i]);
    }
  }

  getThickness = force => this.props.selectedTool === 1
    ? this.props.penThicknessCoefficient * force
    : this.props.eraserThicknessCoefficient * force;

  shouldComponentUpdate = () => false;

  render() {
    return (
      <div className='canvas'>
        {/* TODO: refs をやめる */}
        <DestinationCanvasPiece ref={'destinationCanvasPiece'} canvasWidth={this.canvasWidth} canvasHeight={this.canvasHeight} />
      </div>
    );
  }
}

export default Canvas;
