(function() {
  //HTML上の canvas タグを取得
  let canvas = document.getElementById('canvas');

  let canvasWidth = 800;
  let canvasHeight = 500;

  let thickness = 0;

  let penGrounded = false;

  let pointerX;
  let pointerY;

  canvas.addEventListener('touchstart', (e) => {
    let rect = e.target.getBoundingClientRect();
    penGrounded = true;

    pointerX = ~~(e.changedTouches[0].clientX - rect.left);
    pointerY = ~~(e.changedTouches[0].clientY - rect.top);
  });

  canvas.addEventListener('touchmove', (e) => {
    console.log(e);
    let rect = e.target.getBoundingClientRect();
    penGrounded = true;

    let X = ~~(e.changedTouches[0].clientX - rect.left);
    let Y = ~~(e.changedTouches[0].clientY - rect.top);
    let thickness = e.changedTouches[0].force;

    draw(pointerX, pointerY, X, Y, thickness);

    pointerX = X;
    pointerY = Y;
  });

  canvas.addEventListener('touchend', (e) => {
    let rect = e.target.getBoundingClientRect();
    penGrounded = false;

    let X = ~~(e.changedTouches[0].clientX - rect.left);
    let Y = ~~(e.changedTouches[0].clientY - rect.top);
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
