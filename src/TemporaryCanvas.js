import React from 'react';
import './Canvas.css';

class TemporaryCanvas extends React.Component {
  // TODO: props で渡されるようにしよう
  canvasWidth = 2048;
  canvasHeight = 2048;

  constructor(props) {
    super(props);
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.context = this.canvas.getContext('2d');

    this.context.lineCap = 'round';
    this.context.strokeStyle = this.props.tool.color;
  }

  strokeAdd = stroke => {
    this.context.beginPath();
    this.context.lineWidth = stroke.thickness;
    // TODO: 毎回 moveTo → lineTo してるけど、context が最後のペンの位置を保持してる(?)と思うので、
    // 描き始めの最初だけ moveTo してあとは lineTo → stroke の繰り返しでいけそうな気がする
    this.context.moveTo(stroke.x1, stroke.y1);
    this.context.lineTo(stroke.x2, stroke.y2);
    this.context.stroke();
  }

  getImageBase64 = () => this.canvas.toDataURL();

  getCanvasElement = () => this.canvas;

  shouldComponentUpdate = () => false;

  render() {
    return this.canvas;
  }
}

export default TemporaryCanvas;
