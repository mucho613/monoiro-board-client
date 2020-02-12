import React from 'react';
import './Canvas.css';

class DestinationCanvasPiece extends React.Component {
  componentDidMount() {
    this.context = this.refs.canvas.getContext('2d');
    this.context.beginPath();
    this.context.strokeStyle = '#000000';
    this.context.moveTo(0, 0,)
    this.context.lineTo(100, 100);
    this.context.stroke();
  }

  commit = action => {
    // 画像から転写する(commit される Action が全て画像変換済みの前提)
    if(action.image) {
      this.context.globalAlpha = action.alpha;
      this.context.drawImage(action.image, action.left, action.top);
    }
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
