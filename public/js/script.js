(function() {
  window.onpageshow = function(event) {
    if (event.persisted) {
      window.location.reload()
    }
  };

  //HTML上の canvas タグを取得
  let canvas = document.getElementById('canvas');

  let penBtn = document.getElementById('pen-btn');
  let eraserBtn = document.getElementById('eraser-btn');
  let allEraseBtn = document.getElementById('all-erase-btn');

  let canvasWrapper = document.getElementById('canvas-wrapper');

  let debugInfo = document.getElementById('debug-info');

  let pen = document.getElementById('pen');

  let socket = io.connect('http://198.13.35.247:8080');

  canvas.addEventListener('touchmove', (e) => {    
    let azimuthAngle = e.touches[0].azimuthAngle || 0;
    let altitudeAngle = e.touches[0].altitudeAngle || 0;
  });

  let defaultColor = "#555555";
  let defaultAlpha = 1.0;
  let thicknessCoefficient = 4;

  let canvasWidth = 2000;
  let canvasHeight = 2000;

  let stopScroll = function(e) {
    e.preventDefault();
  }

  penBtn.addEventListener('click', (e) => {
    thicknessCoefficient = 4;
    defaultColor = "#555555";
  });

  eraserBtn.addEventListener('click', (e) => {
    thicknessCoefficient = 32;
    defaultColor = "#f5f5f5";
  });

  allEraseBtn.addEventListener('click', (e) => {
    allClear();
    socket.emit('clear send');
  });


  let penGrounded = false;
  let scrolled = false;

  let pointerX;
  let pointerY;

  let rectX = null, rectY;

  let debug = true;

  let firstDraw = (e) => {
    let rect = e.target.getBoundingClientRect();
    rectX = rect.left;
    rectY = rect.top;
    scrolled = false;
  }

  window.addEventListener('scroll', (e) => {
    scrolled = true;
  });

  canvasWrapper.addEventListener('scroll', (e) => {
    scrolled = true;
  });

  canvas.addEventListener('touchmove', stopScroll, { passive: false });

  canvas.addEventListener('mousedown', (e) => {
    if(!rectX || scrolled) firstDraw(e);

    penGrounded = true;

    pointerX = ~~(e.clientX - rectX);
    pointerY = ~~(e.clientY - rectY);
  });

  canvas.addEventListener('mousemove', (e) => {
    let X = ~~(e.clientX - rectX);
    let Y = ~~(e.clientY - rectY);

    if(penGrounded) {
      draw(pointerX, pointerY, X, Y, 1 * thicknessCoefficient);
    }

    pointerX = X;
    pointerY = Y;
  });

  canvas.addEventListener('mouseup', (e) => {
    if(debug) console.log(e);

    penGrounded = false;

    let X = ~~(e.clientX - rectX);
    let Y = ~~(e.clientY - rectY);

    draw(pointerX, pointerY, X, Y, 1 * thicknessCoefficient);
  });

  canvas.addEventListener('touchstart', (e) => {
    if(e.touches[0].touchType == 'direct') {
      canvas.removeEventListener('touchmove', stopScroll);
      return;
    }
    if(!rectX || scrolled) firstDraw(e);

    pointerX = ~~(e.changedTouches[0].clientX - rectX);
    pointerY = ~~(e.changedTouches[0].clientY - rectY);
  });

  canvas.addEventListener('touchmove', (e) => {
    debugInfo.innerHTML =
      "touchType: " + e.touches[0].touchType +
      "<br>radiusX: " + e.touches[0].radiusX +
      "<br>radiusY: " + e.touches[0].radiusX +
      "<br>angle: " + e.touches[0].rotationAngle +
      "<br>azimuthAngle: " + e.touches[0].azimuthAngle +
      "<br>altitudeAngle: " + e.touches[0].altitudeAngle;

    if(e.touches[0].touchType == 'direct') {
      canvas.removeEventListener('touchmove', stopScroll);
      return;
    } else if(e.touches[0].touchType == 'stylus') {
      canvas.addEventListener('touchmove', stopScroll, { passive: false });
    }

    let X = ~~(e.changedTouches[0].clientX - rectX);
    let Y = ~~(e.changedTouches[0].clientY - rectY);
    let thickness = e.changedTouches[0].force;

    draw(pointerX, pointerY, X, Y, thickness * thicknessCoefficient);

    pointerX = X;
    pointerY = Y;
  });

  canvas.addEventListener('touchend', (e) => {
    if(e.touches[0].touchType == 'direct') {
      canvas.removeEventListener('touchmove', stopScroll);
      return;
    } else if(e.touches[0].touchType == 'stylus') {
      canvas.addEventListener('touchmove', stopScroll, { passive: false });
    }

    let X = ~~(e.changedTouches[0].clientX - rectX);
    let Y = ~~(e.changedTouches[0].clientY - rectY);
    let thickness = e.changedTouches[0].force;

    draw(pointerX, pointerY, X, Y, thickness * thicknessCoefficient);
  });

  let ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  socket.on('send user', function (msg) {
    drawCore(msg.x1, msg.y1, msg.x2, msg.y2, msg.color, msg.thickness);
  });

  socket.on('clear user', () => {
    allClear();
  });

  function draw(x1, y1, x2, y2, thickness) {
    socket.emit('server send', { x1: x1, y1: y1, x2: x2, y2: y2, color: defaultColor, thickness: thickness});
    drawCore(x1, y1, x2, y2, defaultColor, thickness);
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
})();
