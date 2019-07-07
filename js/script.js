(function() {
  //HTML上の canvas タグを取得
  let canvas = document.getElementById('canvas');

  let canvasWidth = 800;
  let canvasHeight = 500;

  let thickness = 0;

  Pressure.set('#canvas', {
    start: function(event){
      // this is called on force start
      drawStart(event);
    },
    change: function(force, event){
      thickness = force;
      drawMove(event);
    },
    end: function(){
      drawEnd();
    }
  });

  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, { passive: false });

  //キャンバスの背景カラーを決定。 fillRectは長方形に塗るメソッド
  var ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  //初期値（サイズ、色、アルファ値）の決定
  let defocolor = "#555555";
  let defoalpha = 1.0;

  //マウス継続値の初期値、ここがポイント
  let mouseX = "";
  let mouseY = "";

  //マウス動いていて、かつ左クリック時に発火。
  function drawMove(e) {
    var rect = e.target.getBoundingClientRect();

    var X = ~~(e.clientX - rect.left);
    var Y = ~~(e.clientY - rect.top);

    // console.log("X: " + X + ", Y:" + Y);

    //draw 関数にマウスの位置を渡す
    draw(X, Y);
  };

  function drawStart(e) {
    var rect = e.target.getBoundingClientRect();
    var X = ~~(e.clientX - rect.left);
    var Y = ~~(e.clientY - rect.top);
    draw(X, Y);
  };

  //渡されたマウス位置を元に直線を描く関数
  function draw(X, Y) {
    ctx.beginPath();
    ctx.globalAlpha = defoalpha;
    //マウス継続値によって場合分け、直線の moveTo（スタート地点）を決定
    if (mouseX === "") {
        //継続値が初期値の場合は、現在のマウス位置をスタート位置とする
        ctx.moveTo(X, Y);
    } else {
        //継続値が初期値ではない場合は、前回のゴール位置を次のスタート位置とする
        ctx.moveTo(mouseX, mouseY);
    }
    // lineTo（ゴール地点）の決定、現在のマウス位置をゴール地点とする
    ctx.lineTo(X, Y);
    // 直線の角を「丸」、サイズと色を決める
    ctx.lineCap = "round";
    ctx.lineWidth = thickness * 4;
    // ctx.lineWidth = 4;
    
    ctx.strokeStyle = defocolor;
    ctx.stroke();
    //マウス継続値に現在のマウス位置、つまりゴール位置を代入
    mouseX = X;
    mouseY = Y;
  };

  //左クリック終了、またはマウスが領域から外れた際、継続値を初期値に戻す
  function drawEnd() {
    mouseX = "";
    mouseY = "";
  }
})();
