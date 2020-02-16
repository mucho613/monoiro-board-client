import React from 'react';
import './Canvas.css';

class DestinationCanvasPiece extends React.Component {
  componentDidMount() {
    this.context = this.refs.canvas.getContext('2d');
  }

  commit = action => {
    this.context.globalAlpha = action.tool.alpha;
    this.context.globalCompositeOperation = action.tool.type === 'pen'
      ? 'source-over'
      : 'destination-out';

    if(action.image) {
      this.context.drawImage(action.image, action.left, action.top);
    } else {
      this.context.drawImage(action.canvas.getCanvasElement(), 0, 0);
    }
  }

  clear = () => {
    this.context.clearRect(0, 0, this.props.canvasWidth, this.props.canvasHeight);
  }

  initialize = image => this.context.drawImage(image, 0, 0);

  shouldComponentUpdate = () => false;
  
  render() {
    return (
      <canvas ref="canvas" className="destination-canvas" width={this.props.canvasWidth} height={this.props.canvasHeight}></canvas>
    );
  }
}

export default DestinationCanvasPiece;
