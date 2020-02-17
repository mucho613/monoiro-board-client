import React from 'react';
import './Canvas.css';

class DestinationCanvasPiece extends React.Component {
  componentDidMount() {
    this.context = this.refs.canvas.getContext('2d');

    this.temporaryCanvas = document.createElement('canvas');
    this.temporaryCanvasContext = this.temporaryCanvas.getContext('2d');
  }

  commit = action => {
    this.context.globalAlpha = action.tool.alpha;
    this.context.globalCompositeOperation =
      action.tool.type === 'pen' || action.tool.type === 'destinationcanvas'
        ? 'source-over'
        : 'destination-out';

    if(action.image) {
      this.context.drawImage(action.image, action.left, action.top);
    }
    else if(action.stroke.length > 1) {
      const width = action.right - action.left;
      const height = action.bottom - action.top;
      this.temporaryCanvas.width = width;
      this.temporaryCanvas.height = height;
      this.temporaryCanvasContext.clearRect(0, 0, width, height);

      this.temporaryCanvasContext.lineCap = 'round';
      this.temporaryCanvasContext.lineJoin = 'round';
      this.temporaryCanvasContext.strokeStyle = action.tool.color;

      for(let i = 1; i < action.stroke.length; i++) {
        const previousPoint = action.stroke[i - 1];
        const point = action.stroke[i];
        const thickness = point.force * action.tool.thicknessCoefficient;
        
        this.temporaryCanvasContext.beginPath();
        this.temporaryCanvasContext.lineWidth = thickness;
        this.temporaryCanvasContext.moveTo(previousPoint.x - action.left, previousPoint.y - action.top);
        this.temporaryCanvasContext.lineTo(point.x - action.left, point.y - action.top);
        this.temporaryCanvasContext.stroke();
      }

      this.context.drawImage(this.temporaryCanvas, action.left, action.top);
    }
  }

  clear = () => this.context.clearRect(0, 0, this.props.canvasWidth, this.props.canvasHeight);

  initialize = image => this.context.drawImage(image, 0, 0);

  shouldComponentUpdate = () => false;
  
  render() {
    return (
      <canvas ref="canvas" className="destination-canvas" width={this.props.canvasWidth} height={this.props.canvasHeight}></canvas>
    );
  }
}

export default DestinationCanvasPiece;
