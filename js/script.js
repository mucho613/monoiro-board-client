(function() {
  //HTML上の canvas タグを取得
  let canvas = document.getElementById('canvas');

  let penBtn = document.getElementById('pen-btn');
  let eraserBtn = document.getElementById('eraser-btn');
  let allEraseBtn = document.getElementById('all-erase-btn');


  let defaultColor = "#555555";
  let defaultAlpha = 1.0;
  let thicknessCoefficient = 1;

  let canvasWidth = 800;
  let canvasHeight = 500;

  penBtn.addEventListener('click', (e) => {
    thicknessCoefficient = 1;
    defaultColor = "#555555";
  });

  eraserBtn.addEventListener('click', (e) => {
    thicknessCoefficient = 4;
    defaultColor = "#f5f5f5";
  });

  allEraseBtn.addEventListener('click', (e) => {
    ctx.beginPath();
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
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
    if(!rectX || scrolled) firstDraw(e);

    pointerX = ~~(e.changedTouches[0].clientX - rectX);
    pointerY = ~~(e.changedTouches[0].clientY - rectY);
  });

  canvas.addEventListener('touchmove', (e) => {
    let X = ~~(e.changedTouches[0].clientX - rectX);
    let Y = ~~(e.changedTouches[0].clientY - rectY);
    let thickness = e.changedTouches[0].force;

    draw(pointerX, pointerY, X, Y, thickness * thicknessCoefficient);

    pointerX = X;
    pointerY = Y;
  });

  canvas.addEventListener('touchend', (e) => {
    let X = ~~(e.changedTouches[0].clientX - rectX);
    let Y = ~~(e.changedTouches[0].clientY - rectY);
    let thickness = e.changedTouches[0].force;

    draw(pointerX, pointerY, X, Y, thickness * thicknessCoefficient);
  });

  // タッチされてもスクロールしないように
  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, { passive: false });

  let ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

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
