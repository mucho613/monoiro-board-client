import React from 'react';
import './App.css';

class Canvas extends React.Component {
  canvasWidth = 2000;
  canvasHeight = 2000;

  // Canvas 関連のやつ
  penGrounded = false;
  scrolled = false;
  previousPositionX; previousPositionY;
  rectX = null;
  rectY;
  previousForce = 0;
  initialTouch = true;

  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.canvas = document.getElementById('canvas');
    this.canvasContext = this.canvas.getContext('2d');
    this.allClear();
    this.canvas.addEventListener('touchmove', this.stopScroll, { passive: false });
  }

  recalculatePositionInCanvasCoodinate = e => {
    let rect = e.target.getBoundingClientRect();
    this.rectX = rect.left;
    this.rectY = rect.top;
    this.scrolled = false;
  }

  stopScroll = e => e.preventDefault();

  handleMouseDown = e => {
    if(!this.rectX || this.scrolled) this.recalculatePositionInCanvasCoodinate(e);

    this.previousPositionX = ~~(e.clientX - this.rectX);
    this.previousPositionY = ~~(e.clientY - this.rectY);
    
    // ペンを接地状態にする
    this.penGrounded = true;
  }

  handleMouseMove = e => {
    if(this.penGrounded) {
      let X = ~~(e.clientX - this.rectX);
      let Y = ~~(e.clientY - this.rectY);

      this.penStroke(this.previousPositionX, this.previousPositionY, X, Y, 0.5);

      this.previousPositionX = X;
      this.previousPositionY = Y;
    }
  }

  handleMouseUp = e => {
    let X = ~~(e.clientX - this.rectX);
    let Y = ~~(e.clientY - this.rectY);

    this.penStroke(this.previousPositionX, this.previousPositionY, X, Y, 0.5);

    // ペンの接地状態を解除
    this.penGrounded = false;
  }

  handleTouchStart = e => {
    const touch = e.changedTouches[0];

    if(touch.touchType === 'direct') {
      this.canvas.removeEventListener('touchmove', this.stopScroll, { passive: false });
      return;
    }

    if(!this.rectX || this.scrolled) this.recalculatePositionInCanvasCoodinate(e);

    this.previousPositionX = ~~(touch.clientX - this.rectX);
    this.previousPositionY = ~~(touch.clientY - this.rectY);
  }

  handleTouchMove = e => {
    const touch = e.changedTouches[0];

    let X = ~~(touch.clientX - this.rectX);
    let Y = ~~(touch.clientY - this.rectY);

    let thickness;
    let currentForce = touch.force;

    if(this.initialTouch) {
      thickness = 0;
      this.previousForce = currentForce;
      this.initialTouch = false;
    }
    else {
      thickness = (currentForce + this.previousForce) / 2;
    }

    this.penStroke(this.previousPositionX, this.previousPositionY, X, Y, thickness);

    this.previousPositionX = X;
    this.previousPositionY = Y;
  }

  handleTouchEnd = e => {
    const touch = e.changedTouches[0];

    this.canvas.addEventListener('touchmove', this.stopScroll, { passive: false });

    if(touch.touchType === 'direct') {
      return;
    }

    this.initialTouch = true;

    let X = ~~(touch.clientX - this.rectX);
    let Y = ~~(touch.clientY - this.rectY);

    let currentForce = touch.force;

    this.penStroke(this.previousPositionX, this.previousPositionY, X, Y, currentForce);
  }

  penStroke = (x1, y1, x2, y2, force) => {
    let thickness = this.state.selectedTool === 1
      ? this.state.penThicknessCoefficient * force
      : this.state.eraserThicknessCoefficient * force;

    let drawColor = this.state.selectedTool === 1
      ? this.state.penColor
      : this.state.eraserColor;

    if(thickness !== 0) {
      this.props.onDraw({ x1: x1, y1: y1, x2: x2, y2: y2, color: drawColor, thickness: thickness});
      this.draw(x1, y1, x2, y2, drawColor, thickness);
    }
  };

  draw = (x1, y1, x2, y2, color, thickness) => {
    this.canvasContext.beginPath();
    this.canvasContext.globalAlpha = this.state.defaultAlpha;

    this.canvasContext.moveTo(x1, y1);
    this.canvasContext.lineTo(x2, y2);
    this.canvasContext.lineCap = "round";
    this.canvasContext.lineWidth = thickness;
    this.canvasContext.strokeStyle = color;

    this.canvasContext.stroke();
  };

  allClear = () => {
    this.canvasContext.beginPath();
    this.canvasContext.fillStyle = "#f5f5f5";
    this.canvasContext.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  render() {
    if(this.props.initialImage) this.canvasContext.drawImage(this.props.initialImage, 0, 0);

    return (
      <div onScroll={() => this.scrolled = true} className="canvas-wrapper">
        <canvas
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          onTouchStart={this.handleTouchStart}
          onTouchMove={this.handleTouchMove}
          onTouchEnd={this.handleTouchEnd}
          id="canvas" width={this.canvasWidth} height={this.canvasHeight}>
        </canvas>
      </div>
    );
  }
}

export default Canvas;
