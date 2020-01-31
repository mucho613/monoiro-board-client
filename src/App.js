import React from 'react';
import './App.css';

import io from 'socket.io-client';
import Toolbox from './ToolBox';

class App extends React.Component {
  canvasWidth = 2000;
  canvasHeight = 2000;

  socket = io.connect('https://mucho613.space:8080');

  constructor() {
    super();

    this.state = {
      splashWindowIsVisible: true,
      leftyUi: false,

      selectedTool: 1,
      penColor: "#555555",
      eraserColor: "#f5f5f5",
      defaultAlpha: 1.0,

      penThicknessCoefficient: 16,
      eraserThicknessCoefficient: 64
    }
  }

  componentDidMount() {
    this.canvas = document.getElementById('canvas');
    this.canvasContext = this.canvas.getContext('2d');

    this.downloadLink = document.getElementById('download-link');
    
    window.onpageshow = e => e.persisted && window.location.reload();

    let stopScroll = e => e.preventDefault();

    let penGrounded = false;
    let scrolled = false;

    let pointerX;
    let pointerY;

    let rectX = null, rectY;

    let firstDraw = e => {
      let rect = e.target.getBoundingClientRect();
      rectX = rect.left;
      rectY = rect.top;
      scrolled = false;
    }
    
    let prevForce = 0;
    let firstTouch = true;

    this.canvasContext.beginPath();
    this.canvasContext.fillStyle = "#f5f5f5";
    this.canvasContext.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    window.addEventListener('scroll', e => scrolled = true);

    this.canvas.addEventListener('mousedown', e => {
      if(!rectX || scrolled) firstDraw(e);

      penGrounded = true;

      pointerX = ~~(e.clientX - rectX);
      pointerY = ~~(e.clientY - rectY);
    });

    this.canvas.addEventListener('mousemove', e => {
      let X = ~~(e.clientX - rectX);
      let Y = ~~(e.clientY - rectY);

      let thicknessCoefficient = this.state.selectedTool === 1
        ? this.state.penThicknessCoefficient
        : this.state.eraserThicknessCoefficient;

      let drawColor = this.state.selectedTool === 1
        ? this.state.penColor
        : this.state.eraserColor;

      if(penGrounded) {
        this.draw(pointerX, pointerY, X, Y, 0.1 * thicknessCoefficient, drawColor);
      }

      pointerX = X;
      pointerY = Y;
    });

    this.canvas.addEventListener('mouseup', e => {
      penGrounded = false;

      let X = ~~(e.clientX - rectX);
      let Y = ~~(e.clientY - rectY);

      let thicknessCoefficient = this.state.selectedTool === 1
        ? this.state.penThicknessCoefficient
        : this.state.eraserThicknessCoefficient;

      let drawColor = this.state.selectedTool === 1
        ? this.state.penColor
        : this.state.eraserColor;

      this.draw(pointerX, pointerY, X, Y, 0.1 * thicknessCoefficient, drawColor);
    });

    this.canvas.addEventListener('touchstart', e => {
      if(e.touches[0].touchType === 'direct') {
        this.canvas.removeEventListener('touchmove', stopScroll);
        return;
      }
      if(!rectX || scrolled) firstDraw(e);

      pointerX = ~~(e.changedTouches[0].clientX - rectX);
      pointerY = ~~(e.changedTouches[0].clientY - rectY);
    });

    this.canvas.addEventListener('touchmove', stopScroll, { passive: false });

    this.canvas.addEventListener('touchmove', e => {
      if(e.changedTouches[0].touchType === 'direct') {
        this.canvas.removeEventListener('touchmove', stopScroll);
        return;
      } else if(e.changedTouches[0].touchType === 'stylus') {
        this.canvas.addEventListener('touchmove', stopScroll, { passive: false });
      }

      let X = ~~(e.changedTouches[0].clientX - rectX);
      let Y = ~~(e.changedTouches[0].clientY - rectY);

      let thickness;
      if(firstTouch) {
        thickness = 0;
        prevForce = 0;
        firstTouch = false;
      }
      else {
        let currentForce = e.changedTouches[0].force;
        if(currentForce - prevForce > 0.01) {
          thickness = prevForce + 0.01;
          prevForce = prevForce + 0.01;
        }
        else {
          thickness = currentForce;
          prevForce = currentForce;
        }
      }

      let thicknessCoefficient = this.state.selectedTool === 1
        ? this.state.penThicknessCoefficient
        : this.state.eraserThicknessCoefficient;

      let drawColor = this.state.selectedTool === 1
        ? this.state.penColor
        : this.state.eraserColor;
      
      this.draw(pointerX, pointerY, X, Y, thickness * thicknessCoefficient, drawColor);

      pointerX = X;
      pointerY = Y;
    });

    this.canvas.addEventListener('touchend', e => {
      if(e.changedTouches[0].touchType !== undefined) {
        if(e.changedTouches[0].touchType === 'direct') {
          this.canvas.removeEventListener('touchmove', stopScroll);
          return;
        } else if(e.changedTouches[0].touchType === 'stylus') {
          this.canvas.addEventListener('touchmove', stopScroll, { passive: false });
        }
      } 

      firstTouch = true;
      let thickness;
      let X = ~~(e.changedTouches[0].clientX - rectX);
      let Y = ~~(e.changedTouches[0].clientY - rectY);

      let currentForce = e.changedTouches[0].force;
      if(currentForce - prevForce > 0.01) {
        thickness = prevForce + 0.01;
        prevForce = prevForce + 0.01;
      }
      else {
        thickness = currentForce;
        prevForce = currentForce;
      }

      let thicknessCoefficient = this.state.selectedTool === 1
        ? this.state.penThicknessCoefficient
        : this.state.eraserThicknessCoefficient;

      let drawColor = this.state.selectedTool === 1
        ? this.state.penColor
        : this.state.eraserColor;

      this.draw(pointerX, pointerY, X, Y, thickness * thicknessCoefficient, drawColor);
    });

    this.socket.on('init', base64 => {
      let initImage = base64.imageData;
      const img = new Image();
      img.src = initImage;
      setTimeout(() => this.canvasContext.drawImage(img, 0, 0), 500);
    });

    this.socket.on('send user', msg => {
      // これを消すとタピオカ現象が発生する！なぜ？？？？？？？？？？？？？？？
      if(msg.thickness !== 0) {
        this.drawCore(msg.x1, msg.y1, msg.x2, msg.y2, msg.color, msg.thickness);
      }
    });
  }

  handleToolChange = tool => this.setState({selectedTool: tool});
  handlePenColorChange = color => this.setState({penColor: color});
  handlePenThicknessChange = thickness => this.setState({penThicknessCoefficient: thickness});
  handleEraserThicknessChange = thickness => this.setState({eraserThicknessCoefficient: thickness});
  handleLeftyChange = isLefty => this.setState({leftyUi: isLefty});
  handleDownload = () => {
    this.downloadLink.href = this.canvas.toDataURL('image/png');
    this.downloadLink.download = "monoiro.png";
    this.downloadLink.click();
  }

  draw = (x1, y1, x2, y2, thickness, drawColor) => {
    if(thickness !== 0) {
      this.socket.emit('server send', { x1: x1, y1: y1, x2: x2, y2: y2, color: drawColor, thickness: thickness});
      this.drawCore(x1, y1, x2, y2, drawColor, thickness);
    }
  };

  drawCore = (x1, y1, x2, y2, color, thickness) => {
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
    return (
      <div className="App">
        <div className={this.state.splashWindowIsVisible ? 'splash' : 'splash hide'}>
          <h1>MONOIRO Board</h1>
          <p className="japanese">モノイロボード 略してモノボ</p>
          <button onClick={e => this.setState({splashWindowIsVisible: false})}>閉じる</button>
        </div>
        
        <Toolbox
          toolState={this.state}
          onToolChange={this.handleToolChange}
          onPenColorChange={this.handlePenColorChange}
          onPenThicknessChange={this.handlePenThicknessChange}
          onEraserThicknessChange={this.handleEraserThicknessChange}
          onLeftyChange={this.handleLeftyChange}
          onDownload={this.handleDownload}
        />
        
        <div onScroll={e => this.setState({scrolled: true})} className="canvas-wrapper">
          <canvas id="canvas" width="2000" height="2000"></canvas>
        </div>
      </div>
    );
  }
}

export default App;
