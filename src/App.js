import React from 'react';
import './App.css';

import io from 'socket.io-client';
import Pickr from '@simonwep/pickr/dist/pickr.es5.min';
import '@simonwep/pickr/dist/themes/nano.min.css';

class App extends React.Component {
  canvas;

  constructor() {
    super();
    
    this.download = this.download.bind(this);
  }

  download() {
    const downloadLink = document.getElementById('download-link');

    downloadLink.href = this.canvas.toDataURL('image/png');
    downloadLink.download = "monoiro.png";
    downloadLink.click();
  }

  componentDidMount() {
    //HTML上の canvas タグを取得
    this.canvas = document.getElementById('canvas');

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

    let penBtn = document.getElementById('pen-btn');
    let eraserBtn = document.getElementById('eraser-btn');
    let allEraseBtn = document.getElementById('all-erase-btn');

    let canvasWrapper = document.getElementById('canvas-wrapper');

    let splash = document.getElementById('splash');
    // let debugInfo = document.getElementById('debug-info');
    let splashClose = document.getElementById('splash-close');
    splashClose.addEventListener('click', () => {
      splash.parentNode.removeChild(splash);
    });

    let leftySwitch = document.getElementById('lefty-switch');
    let ui = document.getElementById('ui');

    let socket = io.connect('https://mucho613.space:8080');

    let initImage = '';

    penBtn.classList.add("active");


    let penColor = "#555555"; // デフォルト
    let drawColor = penColor;
    let defaultAlpha = 1.0;

    let penThicknessCoefficient = 8;
    let eraserThicknessCoefficient = 64;
    let thicknessCoefficient = penThicknessCoefficient;

    let canvasWidth = 2000;
    let canvasHeight = 2000;

    let penThicknessSlider = document.getElementById('pen-thickness');
    let eraserThicknessSlider = document.getElementById('eraser-thickness');

    leftySwitch.addEventListener('change', e => {
      if(e.target.checked) ui.classList.add("lefty");
      else ui.classList.remove("lefty");
    });
    
    penThicknessSlider.addEventListener('change', e => {
      penThicknessCoefficient = e.target.value;
      thicknessCoefficient = penThicknessCoefficient;
    });

    eraserThicknessSlider.addEventListener('change', e => {
      eraserThicknessCoefficient = e.target.value;
      thicknessCoefficient = eraserThicknessCoefficient;
    });

    pickr.on('init', instance => {
    }).on('change', color => {
      penColor = color.toHEXA().toString();
      drawColor = penColor;
    }).on('swatchselect', color => {
      penColor = color.toHEXA().toString();
      drawColor = penColor;
    });

    let stopScroll = e => {
      e.preventDefault();
    }

    let thicknessCoefficientUpdate = value => {
      thicknessCoefficient = value;
    }

    penBtn.addEventListener('click', e => {
      drawColor = penColor;
      penBtn.classList.add("active");
      eraserBtn.classList.remove("active");

      thicknessCoefficientUpdate(penThicknessCoefficient);
    });

    eraserBtn.addEventListener('click', e => {
      drawColor = "#f5f5f5";
      penBtn.classList.remove("active");
      eraserBtn.classList.add("active");

      thicknessCoefficientUpdate(eraserThicknessCoefficient);
    });

    allEraseBtn.addEventListener('click', e => {
      allClear();
      socket.emit('clear send');
    });

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

    window.addEventListener('scroll', e => {
      scrolled = true;
    });

    canvasWrapper.addEventListener('scroll', e => {
      scrolled = true;
    });

    this.canvas.addEventListener('touchmove', stopScroll, { passive: false });

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
        draw(pointerX, pointerY, X, Y, 0.1 * thicknessCoefficient);
      }

      pointerX = X;
      pointerY = Y;
    });

    this.canvas.addEventListener('mouseup', e => {
      penGrounded = false;

      let X = ~~(e.clientX - rectX);
      let Y = ~~(e.clientY - rectY);

      draw(pointerX, pointerY, X, Y, 0.1 * thicknessCoefficient);
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

    let prevForce = 0;
    let firstTouch = true;

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
      
      draw(pointerX, pointerY, X, Y, thickness * thicknessCoefficient);

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

      draw(pointerX, pointerY, X, Y, thickness * thicknessCoefficient);
    });

    let ctx = this.canvas.getContext('2d');
    ctx.beginPath();
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    socket.on('init', base64 => {
      initImage = base64.imageData;

      let img = new Image();
      img.src = initImage;
      setTimeout(() => { ctx.drawImage(img, 0, 0); }, 500);
    });

    socket.on('send user', msg => {
      // これを消すとタピオカ現象が発生する！なぜ？？？？？？？？？？？？？？？
      if(msg.thickness !== 0) {
        drawCore(msg.x1, msg.y1, msg.x2, msg.y2, msg.color, msg.thickness);
      }
    });

    socket.on('clear user', () => {
      allClear();
    });

    function draw(x1, y1, x2, y2, thickness) {
      if(thickness !== 0) {
        socket.emit('server send', { x1: x1, y1: y1, x2: x2, y2: y2, color: drawColor, thickness: thickness});
        drawCore(x1, y1, x2, y2, drawColor, thickness);
      }
    };

    function drawCore(x1, y1, x2, y2, color, thickness) {
      ctx.beginPath();
      ctx.globalAlpha = defaultAlpha;

      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineCap = "round";
      ctx.lineWidth = thickness;
      ctx.strokeStyle = color;

      ctx.stroke();
    };

    function allClear() {
      ctx.beginPath();
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
  }

  render() {
    return (
      <div className="App">
        <div className="splash" id="splash">
          <h1>MONOIRO Board</h1>
          <p className="japanese">モノイロボード 略してモノボ</p>
          <button id="splash-close">閉じる</button>
        </div>
        
        <div id="ui" className="overlay">
          <a id="download-link"></a>
          <button className="tool-button pen-btn" id="pen-btn">ペン</button>
          <button className="tool-button eraser-btn" id="eraser-btn">消しゴム</button>
          <button className="tool-button all-erase-btn" id="all-erase-btn" disabled>全消し</button>
          <button onClick={this.download}>ダウンロード</button>
          <div className="color-picker"></div>
        
          <div>
            <div>ペンの太さ: <span id="pen-thickness-indicator"></span></div>
            <input id="pen-thickness" defaultValue="16" type="range" min="16" max="256"></input>
          </div>
          
          <div>
            <div>消しゴムの太さ: <span id="eraser-thickness-indicator"></span></div>
            <input id="eraser-thickness" defaultValue="64" type="range" min="32" max="512"></input>
          </div>
          
          <div>
            <input id="lefty-switch" type="checkbox" defaultValue="1"></input>左利き
          </div>
        </div>
        
        <div id="canvas-wrapper" className="canvas-wrapper">
          <canvas id="canvas" width="2000" height="2000"></canvas>
        </div>
      </div>
    );
  }
}

export default App;
