(function() {
  //HTML上の canvas タグを取得
  let canvas = document.getElementById('canvas');
  let thickness = 0;

  let canvasWidth = 800;
  let canvasHeight = 500;

  Pressure.set('#canvas', {
    change: function(force){
      thickness = force;
    }
  });

  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, {passive: false});

  //キャンバスの背景カラーを決定。 fillRectは長方形に塗るメソッド
  var ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  //初期値（サイズ、色、アルファ値）の決定
  var defocolor = "#555555";
  var defoalpha = 1.0;

  //マウス継続値の初期値、ここがポイント
  let mouseX = "";
  let mouseY = "";

  //各イベントに紐づけ
  canvas.addEventListener('mousemove', onMove, false);
  canvas.addEventListener('mousedown', onClick, false);
  canvas.addEventListener('mouseup', drawEnd, false);
  canvas.addEventListener('mouseout', drawEnd, false);

  //マウス動いていて、かつ左クリック時に発火。
  function onMove(e) {
      if (e.buttons === 1 || e.witch === 1) {
          var rect = e.target.getBoundingClientRect();
          var X = ~~(e.clientX - rect.left);
          var Y = ~~(e.clientY - rect.top);
          //draw 関数にマウスの位置を渡す
          draw(X, Y);
      };
  };

  //マウスが左クリックされると発火。
  function onClick(e) {
      if (e.button === 0) {
          var rect = e.target.getBoundingClientRect();
          var X = ~~(e.clientX - rect.left);
          var Y = ~~(e.clientY - rect.top);
          //draw 関数にマウスの位置を渡す
          draw(X, Y);
      }
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
      //lineTo（ゴール地点）の決定、現在のマウス位置をゴール地点とする
      ctx.lineTo(X, Y);
      //直線の角を「丸」、サイズと色を決める
      ctx.lineCap = "round";
      ctx.lineWidth = thickness * 4;
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

  //メニューのアイコン関係
  var menuIcon = document.getElementsByClassName("menuicon");
  for (i = 0; i < menuIcon.length; i++) {
      menuIcon[i].addEventListener("click", canvasMenu, false)
  }

  //メニューボタン管理
  function canvasMenu() {
      //id 値によって場合分け
      var thisId = this.id;
      if (thisId.indexOf("size") + 1) {
          defosize = ~~this.id.slice(4, this.id.length);
      }
      if (thisId.indexOf("color") + 1) {
          defocolor = "#" + this.id.slice(5, this.id.length);
      }
      if (thisId.indexOf("alpha") + 1) {
          defoalpha = (~~this.id.slice(5, this.id.length)) / 10;
      }
      if (thisId.indexOf("clear") + 1) {
          //全消しボタン、OKされた場合は fillRect 長方形で覆います
          if (confirm("すべて消去しますか？")) {
              ctx.beginPath();
              ctx.fillStyle = "#f5f5f5";
              ctx.globalAlpha = 1.0;
              ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          }
      }
  }
})();
