const express = require('express');
const app = express();
const path = require('path');

const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 8080;

// ファイル保存用
const fs = require('fs');

const { createCanvas, loadImage } = require('canvas')

let layer = createCanvas(2000, 2000);
let ctx = layer.getContext('2d');

http.listen(PORT, () => {
  console.log('Running at Port ' + PORT);
});

// 静的ファイルのルーティング
app.use(express.static(path.join(__dirname, 'public')));

// その他のリクエストに対する404エラー
app.use((req, res) => {
  res.sendStatus(404);
});

io.on('connection', function (socket) {
  // 新しく入ったユーザーのために、描いてたやつを送信する
  let base64 = layer.toDataURL();
  socket.emit('init', { imageData: base64 });
  console.log("New connection established. Image transmitted.");

  // クライアントからメッセージ受信
  socket.on('clear send', function () {
    socket.broadcast.emit('clear user');
    // サーバー側でも全消しする
    allClear();
  });

  // クライアントからメッセージ受信
  socket.on('server send', function (msg) {
    socket.broadcast.emit('send user', msg);
    // サーバー側でも描画する
    drawCore(msg.x1, msg.y1, msg.x2, msg.y2, msg.color, msg.thickness)
  });

  // 切断
  socket.on('disconnect', function () {
    // io.sockets.emit('user disconnected');
  });
});

function drawCore(x1, y1, x2, y2, color, thickness) {
  ctx.beginPath();
  ctx.globalAlpha = "#555555";

  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineCap = "round";
  ctx.lineWidth = thickness;
  ctx.strokeStyle = color;

  ctx.stroke();
}

function allClear() {
  ctx.beginPath();
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, 2000, 2000);
}

