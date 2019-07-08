const express = require('express');
const app = express();
const path = require('path');

const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.Port || 80;

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
  // クライアントからメッセージ受信
  socket.on('clear send', function () {
    socket.broadcast.emit('clear user');
  });

  // クライアントからメッセージ受信
  socket.on('server send', function (msg) {
    // console.log(msg);
    socket.broadcast.emit('send user', msg);
  });

  // 切断
  socket.on('disconnect', function () {
    // io.sockets.emit('user disconnected');
  });
});
