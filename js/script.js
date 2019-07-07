(function() {
  //HTML上の canvas タグを取得
  let canvas = document.getElementById('canvas');

  let canvasWidth = 800;
  let canvasHeight = 500;

  let penGrounded = false;
  let scrolled = false;

  let pointerX;
  let pointerY;

  let rectX = null, rectY;

  let firstDraw = (e) => {
    let rect = e.target.getBoundingClientRect();
    rectX = rect.left;
    rectY = rect.top;
    scrolled = false;
  }

  window.addEventListener('scroll', (e) => {
    scrolled = true;
  });

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
      draw(pointerX, pointerY, X, Y, 1);
    }

    pointerX = X;
    pointerY = Y;
  });

  canvas.addEventListener('mouseup', (e) => {
    penGrounded = false;

    let X = ~~(e.clientX - rectX);
    let Y = ~~(e.clientY - rectY);

    draw(pointerX, pointerY, X, Y, 1);
  });

  canvas.addEventListener('touchstart', (e) => {
    if(!rectX || scrolled) firstDraw(e);

    pointerX = ~~(e.changedTouches[0].clientX - rectX);
    pointerY = ~~(e.changedTouches[0].clientY - rectY);
  });

  canvas.addEventListener('touchmove', (e) => {
    let X = ~~(e.changedTouches[0].clientX - rectX);
    let Y = ~~(e.changedTouches[0].clientY - rectY);
    let thickness = e.changedTouches[0].force;

    draw(pointerX, pointerY, X, Y, thickness);

    pointerX = X;
    pointerY = Y;
  });

  canvas.addEventListener('touchend', (e) => {
    let X = ~~(e.changedTouches[0].clientX - rectX);
    let Y = ~~(e.changedTouches[0].clientY - rectY);
    let thickness = e.changedTouches[0].force;

    draw(pointerX, pointerY, X, Y, thickness);
  });

  // タッチされてもスクロールしないように
  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, { passive: false });

  let ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  let defaultColor = "#555555";
  let defaultAlpha = 1.0;

  function draw(x1, y1, x2, y2, thickness) {
    ctx.beginPath();
    ctx.globalAlpha = defaultAlpha;

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineCap = "round";
    ctx.lineWidth = thickness * 4;
    
    ctx.strokeStyle = defaultColor;
    ctx.stroke();
  };
})();
