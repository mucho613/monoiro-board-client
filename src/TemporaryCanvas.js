import React from 'react';
import './Canvas.css';

class TemporaryCanvas extends React.Component {
  // TODO: props で渡されるようにしよう
  canvasWidth = 2000;
  canvasHeight = 2000;

  constructor(props) {
    super(props);
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
  }

  componentDidMount() {
    this.context = this.refs.canvas.getContext('2d');
    this.context.lineCap = 'round';
    this.context.strokeStyle = this.props.color;
    this.context.globalAlpha = this.props.alpha;
    this.context.globalCompositeOperation = this.props.actionType === 'Pen'
      ? 'source-over'
      : 'destination-out';
  }

  strokeAdd = stroke => {
    this.context.beginPath();
    this.context.lineWidth = stroke.thickness;
    this.context.moveTo(stroke.x1, stroke.y1);
    this.context.lineTo(stroke.x2, stroke.y2);
    this.context.stroke();
  }

  getImageBase64 = () => this.canvas.toDataURL();

  shouldComponentUpdate = () => false;

  render() {
    return this.canvas;
  }
}

export default TemporaryCanvas;
