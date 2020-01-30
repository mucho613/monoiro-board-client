(function() {
  var downloadLink = document.getElementById('download-link');
  var dlButton = document.getElementById('download-button');

  // 強制リロードさせてキャッシュクリア
  window.onpageshow = event => {
    if (event.persisted) {
      window.location.reload()
    }
  };

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

  //HTML上の canvas タグを取得
  let canvas = document.getElementById('canvas');
  let pen = document.getElementById('pen');

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

  dlButton.addEventListener('click', function(){
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = "monoiro.png";
    downloadLink.click();
  });

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

  canvas.addEventListener('touchmove', stopScroll, { passive: false });

  canvas.addEventListener('mousedown', e => {
    if(!rectX || scrolled) firstDraw(e);

    penGrounded = true;

    pointerX = ~~(e.clientX - rectX);
    pointerY = ~~(e.clientY - rectY);
  });

  canvas.addEventListener('mousemove', e => {
    let X = ~~(e.clientX - rectX);
    let Y = ~~(e.clientY - rectY);

    if(penGrounded) {
      draw(pointerX, pointerY, X, Y, 0.1 * thicknessCoefficient);
    }

    pointerX = X;
    pointerY = Y;
  });

  canvas.addEventListener('mouseup', e => {
    penGrounded = false;

    let X = ~~(e.clientX - rectX);
    let Y = ~~(e.clientY - rectY);

    draw(pointerX, pointerY, X, Y, 0.1 * thicknessCoefficient);
  });

  canvas.addEventListener('touchstart', e => {
    if(e.touches[0].touchType == 'direct') {
      canvas.removeEventListener('touchmove', stopScroll);
      return;
    }
    if(!rectX || scrolled) firstDraw(e);

    pointerX = ~~(e.changedTouches[0].clientX - rectX);
    pointerY = ~~(e.changedTouches[0].clientY - rectY);

    showPen(pointerX, pointerY, e.touches[0].altitudeAngle, e.touches[0].azimuthAngle);
  });

  let prevForce = 0;
  let firstTouch = true;

  canvas.addEventListener('touchmove', e => {
    let touch = e.touches[0];

    if(e.changedTouches[0].touchType == 'direct') {
      canvas.removeEventListener('touchmove', stopScroll);
      return;
    } else if(e.changedTouches[0].touchType == 'stylus') {
      canvas.addEventListener('touchmove', stopScroll, { passive: false });
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
    showPen(X, Y, e.changedTouches[0].altitudeAngle, e.changedTouches[0].azimuthAngle);

    pointerX = X;
    pointerY = Y;
  });

  canvas.addEventListener('touchend', e => {
    if(e.changedTouches[0].touchType !== undefined) {
      if(e.changedTouches[0].touchType == 'direct') {
        canvas.removeEventListener('touchmove', stopScroll);
        return;
      } else if(e.changedTouches[0].touchType == 'stylus') {
        canvas.addEventListener('touchmove', stopScroll, { passive: false });
      }
    } 

    firstTouch = true;

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
    showPen(X, Y, e.changedTouches[0].altitudeAngle, e.changedTouches[0].azimuthAngle);
  });

  let ctx = canvas.getContext('2d');
  let penContext = pen.getContext('2d');
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

    erase();

    ctx.stroke();
  };

  function showPen(x, y, altitudeAngle, azimuthAngle) {
    let penLength = 100;
    penContext.beginPath();
    penContext.moveTo(x, y);
    penContext.lineTo(
      Math.cos(azimuthAngle) * (x + penLength * Math.cos(altitudeAngle)) - Math.sin(azimuthAngle) * (y + penLength * Math.cos(altitudeAngle)),
      Math.sin(azimuthAngle) * (x + penLength * Math.cos(altitudeAngle)) + Math.cos(azimuthAngle) * (y + penLength * Math.cos(altitudeAngle))
    );
    penContext.stroke();
  }

  function erase() {
    penContext.beginPath();
    penContext.clearRect(0, 0, canvasWidth, canvasHeight);
  }

  function allClear() {
    ctx.beginPath();
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
})();
