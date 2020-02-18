import React from 'react';
import './Canvas.css';

import CanvasPiece from './CanvasPiece';

class Canvas extends React.Component {
  canvasWidth = 2048;
  canvasHeight = 2048;

  strokeStart = (x, y, force) => {
    const thickness = this.getThickness(force);
    this.actionStart();
    this.actionUpdate({ x: x, y: y, thickness: thickness });
  }

  strokeMove = (x, y, force) => {
    const thickness = this.getThickness(force);
    if(thickness !== 0) {
      this.actionUpdate({ x: x, y: y, thickness: thickness });
    }
  }

  strokeEnd = (x, y, force) => {
    const thickness = this.getThickness(force);
    this.actionUpdate({ x: x, y: y, thickness: thickness });
    this.actionEnd();
  }

  update = (image, queue) => {
    // this.refs.canvasPiece.clear();
    this.refs.canvasPiece.initialize(image);
    for(let i = 0; i < queue.length; i++) {
      if(queue[i].isActive) {
        this.refs.canvasPiece.commit(queue[i]);
      }
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
        <CanvasPiece ref={'canvasPiece'} canvasWidth={this.canvasWidth} canvasHeight={this.canvasHeight} />
      </div>
    );
  }
}

export default Canvas;
