import React from 'react';
import './App.css';

import io from 'socket.io-client';
import Pickr from '@simonwep/pickr/dist/pickr.es5.min';
import '@simonwep/pickr/dist/themes/nano.min.css';

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
      drawColor: "#555555",
      defaultAlpha: 1.0,

      penThicknessCoefficient: 16,
      eraserThicknessCoefficient: 64,
      thicknessCoefficient: 16
    }

    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    //HTML上の canvas タグを取得
    this.canvas = document.getElementById('canvas');
    this.canvasContext = this.canvas.getContext('2d');
    
    // 強制リロードさせてキャッシュクリア
    window.onpageshow = e => e.persisted ? window.location.reload() : null;

    const pickr = Pickr.create({
      el: '.color-picker',
      theme: 'nano', // or 'monolith', or 'nano'

      swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 0.95)',
        'rgba(156, 39, 176, 0.9)',
        'rgba(103, 58, 183, 0.85)',
        'rgba(63, 81, 181, 0.8)',
        'rgba(33, 150, 243, 0.75)',
        'rgba(3, 169, 244, 0.7)',
        'rgba(0, 188, 212, 0.7)',
        'rgba(0, 150, 136, 0.75)',
        'rgba(76, 175, 80, 0.8)',
        'rgba(139, 195, 74, 0.85)',
        'rgba(205, 220, 57, 0.9)',
        'rgba(255, 235, 59, 0.95)',
        'rgba(255, 193, 7, 1)'
      ],

      components: {
        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
          hex: true,
          rgba: true,
          hsla: true,
          hsva: false,
          cmyk: false,
          input: true,
          clear: false,
          save: true
        }
      }
    });

    let initImage = '';

    pickr.on('init', instance => {
    }).on('change', color => {
      this.setState({
        penColor: color.toHEXA().toString(),
        drawColor: color.toHEXA().toString()
      });
    }).on('swatchselect', color => {
      this.setState({
        penColor: color.toHEXA().toString(),
        drawColor: color.toHEXA().toString()
      });
    });

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

      if(penGrounded) {
        this.draw(pointerX, pointerY, X, Y, 0.1 * this.state.thicknessCoefficient, this.state.drawColor);
      }

      pointerX = X;
      pointerY = Y;
    });

    this.canvas.addEventListener('mouseup', e => {
      penGrounded = false;

      let X = ~~(e.clientX - rectX);
      let Y = ~~(e.clientY - rectY);

      this.draw(pointerX, pointerY, X, Y, 0.1 * this.state.thicknessCoefficient, this.state.drawColor);
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
      
      this.draw(pointerX, pointerY, X, Y, thickness * this.state.thicknessCoefficient, this.state.drawColor);

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

      this.draw(pointerX, pointerY, X, Y, thickness * this.state.thicknessCoefficient, this.state.drawColor);
    });

    this.socket.on('init', base64 => {
      initImage = base64.imageData;

      const img = new Image();
      img.src = initImage;
      setTimeout(() => { this.canvasContext.drawImage(img, 0, 0) }, 500);
    });

    this.socket.on('send user', msg => {
      // これを消すとタピオカ現象が発生する！なぜ？？？？？？？？？？？？？？？
      if(msg.thickness !== 0) {
        this.drawCore(msg.x1, msg.y1, msg.x2, msg.y2, msg.color, msg.thickness);
      }
    });

    this.socket.on('clear user', this.allClear);
  }

  allClearEmit = () => {
    this.allClear();
    this.socket.emit('clear send');
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

  download = () => {
    const downloadLink = document.getElementById('download-link');

    downloadLink.href = this.canvas.toDataURL('image/png');
    downloadLink.download = "monoiro.png";
    downloadLink.click();
  }

  penSelected = (e) => {
    this.setState(state => ({
      drawColor: state.penColor,
      selectedTool: 1,
      thicknessCoefficient: state.penThicknessCoefficient
    }));
  }

  eraserSelected = (e) => {
    console.log(this.canvasContext);
    this.setState(state => ({
      drawColor: "#f5f5f5",
      selectedTool: 2,
      thicknessCoefficient: state.eraserThicknessCoefficient
    }));
  }

  penThicknessChanged = (e) => {
    this.setState({
      penThicknessCoefficient: Number(e.target.value),
      thicknessCoefficient: Number(e.target.value)
    });
  }

  eraserThicknessChanged = (e) => {
    this.setState({
      eraserThicknessCoefficient: Number(e.target.value),
      thicknessCoefficient: Number(e.target.value)
    });
  }

  render() {
    return (
      <div className="App">
        <div className={this.state.splashWindowIsVisible ? 'splash' : 'splash hide'}>
          <h1>MONOIRO Board</h1>
          <p className="japanese">モノイロボード 略してモノボ</p>
          <button onClick={e => this.setState({splashWindowIsVisible: false})}>閉じる</button>
        </div>
        
        <div id="ui" className={this.state.leftyUi ? 'overlay lefty' : 'overlay'}>
          <a id="download-link"></a>
          <button onClick={this.penSelected} className={(this.state.selectedTool === 1 ? 'pen-btn active' : 'pen-btn')}>ペン</button>
          <button onClick={this.eraserSelected} className={(this.state.selectedTool === 2 ? 'eraser-btn active' : 'eraser-btn')}>消しゴム</button>
          <button onClick={this.allClearEmit} className="all-erase-btn" disabled>全消し</button>
          <button onClick={this.download}>ダウンロード</button>
          <div className="color-picker"></div>
        
          <div>
            <div>ペンの太さ: {this.state.penThicknessCoefficient}</div>
            <input onChange={this.penThicknessChanged} defaultValue={this.state.penThicknessCoefficient} type="range" min="16" max="256"></input>
          </div>
          
          <div>
            <div>消しゴムの太さ: {this.state.eraserThicknessCoefficient}</div>
            <input onChange={this.eraserThicknessChanged} defaultValue={this.state.eraserThicknessCoefficient} type="range" min="32" max="512"></input>
          </div>
          
          <div>
            <input onChange={e => this.setState({leftyUi: e.target.checked})} type="checkbox"></input>左利き
          </div>
        </div>
        
        <div onScroll={e => this.setState({scrolled: true})} className="canvas-wrapper">
          <canvas id="canvas" width="2000" height="2000"></canvas>
        </div>
      </div>
    );
  }
}

export default App;
