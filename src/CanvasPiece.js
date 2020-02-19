import React from 'react';
import './Canvas.css';

class CanvasPiece extends React.Component {
  constructor() {
    super();

    this.canvasRef = React.createRef();

    this.temporaryCanvas = document.createElement('canvas');
    this.temporaryCanvasContext = this.temporaryCanvas.getContext('2d');
  }

  componentDidMount() {
    this.context = this.canvasRef.current.getContext('2d');
  }

  initialize = image => {
    this.context.globalAlpha = 1.0;
    this.context.globalCompositeOperation = 'source-over';
    this.context.drawImage(image, 0, 0);
  }

  commit = action => {
    this.context.globalAlpha = action.tool.alpha;
    this.context.globalCompositeOperation = action.tool.type === 'pen'
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

  shouldComponentUpdate = () => false;
  
  render() {
    return (
      <canvas ref={this.canvasRef} className="canvas-piece" width={this.props.canvasWidth} height={this.props.canvasHeight}></canvas>
    );
  }
}

export default CanvasPiece;