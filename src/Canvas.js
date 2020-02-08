import React from 'react';
import './Canvas.css';

class Canvas extends React.Component {
  canvasWidth = 2000;
  canvasHeight = 2000;

  undoHistoryLength = 1000;

  // Canvas 関連のやつ
  penGrounded = false;
  scrolled = false;
  previousPositionX; previousPositionY;
  rectX = null;
  rectY;
  previousForce = 0;
  initialTouch = true;
  initialImageRendered = false;
  undoHistory = [];

  componentDidMount() {
    this.canvasWrapper = document.getElementById('canvas-wrapper');
    this.canvasWrapper.addEventListener('touchmove', this.stopScroll, { passive: false });

    this.destinationCanvas = document.getElementById('canvas');
    this.destinationCanvasContext = this.destinationCanvas.getContext('2d');

    this.temporaryCanvas = document.getElementById('temp-layer');
    this.temporaryCanvasContext = this.temporaryCanvas.getContext('2d');
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

    this.actionStart();
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

    // ペンの接地状態を解除
    this.penGrounded = false;

    if(X !== this.previousPositionX && Y !== this.previousPositionY) {
      this.penStroke(this.previousPositionX, this.previousPositionY, X, Y, 0.5);
      return;
    }

    this.actionEnd();
  }

  handleTouchStart = e => {
    const touch = e.changedTouches[0];

    if(touch.touchType === 'direct') {
      this.canvasWrapper.removeEventListener('touchmove', this.stopScroll);
      return;
    }

    if(!this.rectX || this.scrolled) this.recalculatePositionInCanvasCoodinate(e);

    this.previousPositionX = ~~(touch.clientX - this.rectX);
    this.previousPositionY = ~~(touch.clientY - this.rectY);

    this.actionStart();
  }

  handleTouchMove = e => {
    const touch = e.changedTouches[0];

    if(touch.touchType === 'direct') {
      this.canvasWrapper.removeEventListener('touchmove', this.stopScroll);
      return;
    } else if(touch.touchType === 'stylus') {
      this.canvasWrapper.addEventListener('touchmove', this.stopScroll, { passive: false });
    }

    const X = ~~(touch.clientX - this.rectX);
    const Y = ~~(touch.clientY - this.rectY);

    let thickness;
    const currentForce = touch.force;

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

    this.canvasWrapper.addEventListener('touchmove', this.stopScroll, { passive: false });
    if(touch.touchType === 'direct') return;

    this.initialTouch = true;

    const X = ~~(touch.clientX - this.rectX);
    const Y = ~~(touch.clientY - this.rectY);

    const currentForce = touch.force;

    this.penStroke(this.previousPositionX, this.previousPositionY, X, Y, currentForce);

    this.actionEnd();
  }

  actionStart = () => {
    this.undoHistory.push({
      id: this.props.id,
      action: [],
      actionType: 'stroke',
      left: this.canvasWidth,
      right: 0,
      top: this.canvasHeight,
      bottom: 0
    });

    if(this.undoHistory.length > this.undoHistoryLength) {
      const history = this.undoHistory.shift();
      if(history.actionType === 'image') {
        this.destinationCanvasContext.drawImage(history.action, history.left, history.top);
        console.log(history.action, history.left, history.top);
      }
      else if(history.actionType === 'stroke') {
        for(let j = 0; j < history.action.length; j++) {
          this.drawToTempLayer(history.action[j]);
        }
      }
    }
    console.log('Action Start', this.undoHistory);
  }

  actionAdd = line => {
    const history = this.undoHistory[this.undoHistory.length - 1]

    history.action.push(line);

    const left = line.x2 - line.thickness;
    const top = line.y2 - line.thickness;
    const right = line.x2 + line.thickness;
    const bottom = line.y2 + line.thickness;

    if(history.left > left) history.left = left;
    if(history.top > top) history.top = top;
    if(history.right < right) history.right = right;
    if(history.bottom < bottom) history.bottom = bottom;
  }

  actionEnd = () => {
    const history = this.undoHistory[this.undoHistory.length - 1];
    const canvas = document.createElement('canvas');
    canvas.width = history.right - history.left;
    canvas.height = history.bottom - history.top;
    
    const context = canvas.getContext('2d');

    let action = history.action;

    for(let j = 0; j < action.length; j++) {
      context.beginPath();
      context.globalAlpha = this.props.defaultAlpha;
  
      context.moveTo(action[j].x1 - history.left, action[j].y1 - history.top);
      context.lineTo(action[j].x2 - history.left, action[j].y2 - history.top);
      context.lineCap = 'round';
      context.lineWidth = action[j].thickness;
      context.strokeStyle = action[j].color;
      context.globalCompositeOperation = action[j].tool === 1
        ? 'source-over'
        : 'destination-out';
  
      context.stroke();
    }
  
    const image = new Image(history.right - history.left, history.bottom - history.top);
    image.src = canvas.toDataURL('png');
    history.action = image;
    history.actionType = 'image';
    console.log('Action End', this.undoHistory);
  }

  undo = () => {
    this.undoHistory.pop();
    this.updateTemporaryLayer();
    console.log("Undo!", this.undoHistory);
  }

  updateTemporaryLayer = () => {
    this.temporaryCanvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    for(let i = 0; i < this.undoHistory.length; i++) {
      const history = this.undoHistory[i];

      if(history.actionType === 'image') {
        this.temporaryCanvasContext.drawImage(history.action, history.left, history.top);
      }
      else if(history.actionType === 'stroke') {
        for(let j = 0; j < history.action.length; j++) {
          this.drawToTempLayer(history.action[j]);
        }
      }
    }
  }

  penStroke = (x1, y1, x2, y2, force) => {
    const thickness = this.props.selectedTool === 1
      ? this.props.penThicknessCoefficient * force
      : this.props.eraserThicknessCoefficient * force;

    if(thickness !== 0) {
      const line = { tool: this.props.selectedTool, x1: x1, y1: y1, x2: x2, y2: y2, color: this.props.penColor, thickness: thickness};

      this.props.onDraw(line);
      this.actionAdd(line);
      this.updateTemporaryLayer();
    }
  };

  drawToTempLayer = msg => {
    this.temporaryCanvasContext.beginPath();
    this.temporaryCanvasContext.globalAlpha = this.props.defaultAlpha;

    this.temporaryCanvasContext.moveTo(msg.x1, msg.y1);
    this.temporaryCanvasContext.lineTo(msg.x2, msg.y2);
    this.temporaryCanvasContext.lineCap = 'round';
    this.temporaryCanvasContext.lineWidth = msg.thickness;
    this.temporaryCanvasContext.strokeStyle = msg.color;
    this.temporaryCanvasContext.globalCompositeOperation = msg.tool === 1
      ? 'source-over'
      : 'destination-out';

    this.temporaryCanvasContext.stroke();
  };

  drawToDestLayer = msg => {
    this.destinationCanvasContext.beginPath();
    this.destinationCanvasContext.globalAlpha = this.props.defaultAlpha;

    this.destinationCanvasContext.moveTo(msg.x1, msg.y1);
    this.destinationCanvasContext.lineTo(msg.x2, msg.y2);
    this.destinationCanvasContext.lineCap = 'round';
    this.destinationCanvasContext.lineWidth = msg.thickness;
    this.destinationCanvasContext.strokeStyle = msg.color;
    this.destinationCanvasContext.globalCompositeOperation = msg.tool === 1
      ? 'source-over'
      : 'destination-out';

    this.destinationCanvasContext.stroke();
  };

  initialize = image => {
    this.destinationCanvasContext.drawImage(image, 0, 0);
  }

  getCanvasImageBase64 = () => this.destinationCanvas.toDataURL();

  shouldComponentUpdate = () => false;

  render() {
    return (
      <div onScroll={() => this.scrolled = true}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
        className='canvas-wrapper'
        id={'canvas-wrapper'}>
        <canvas id='temp-layer' width={this.canvasWidth} height={this.canvasHeight}></canvas>
        <canvas id='canvas' width={this.canvasWidth} height={this.canvasHeight}></canvas>
      </div>
    );
  }
}

export default Canvas;
