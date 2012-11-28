var express = require('express');
var app = express();
var port = 8080;
app.configure(function(){
  app.use(express.static(__dirname + '/src'));
});


console.log('Static file server running at http://localhost');


var server = app.listen(port);
var io = require('socket.io').listen(server);

var players = [];

io.set('log level', 0);
 
io.sockets.on('connection', function(socket) {
  
  socket.emit('addplayer', players.map(function (player) {
    return player.id;
  }));
  
  players.push({
    id: socket.id,
    pos: {x: 0, y: 0},
    dir: {x: 0, y: 0}
  });
  
  socket.on('disconnect', function () {
    socket.leave('game');
    socket.broadcast.to('game').emit('removeplayer', [socket.id]);
    players = players.filter(function (player) {
      return player.id !== socket.id;
    });
  });
  
  socket.join('game');
  socket.broadcast.to('game').emit('addplayer', [socket.id]);
  
  socket.on('playerstate', function (data) {
    for (var i = 0; i < players.length; i++) {
      if (players[i].id === socket.id) {
        players[i].pos = data.position;
        players[i].dir = data.direction;
      }
    }
  });
  
  setInterval(function () {
    socket.emit('gamestate', players);
  }, 50);
});

