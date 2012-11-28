var express = require('express');
var app = express();
var port = 8080;
app.configure(function(){
  app.use(express.static(__dirname + '/src'));
});


console.log('Static file server running at http://localhost');


var server = app.listen(port);
var io = require('socket.io').listen(server);
io.set('log level', 0);

// holds the currently connected players
var players = [];
 
io.sockets.on('connection', function(socket) {
  // a client has connected
  
  var player;  
  
  // initialize the client
  socket.emit('init', players);
  socket.join('game');
  
  socket.on('disconnect', function () {
    // a client has left
    socket.leave('game');
    socket.broadcast.to('game').emit('removeplayer', player);
    players = players.filter(function (player) {
      return player.id !== socket.id;
    });
  });  
  
  socket.on('playerstate', function (data) {
    // the client updates its state
    var firstUpdate = player === undefined;
    player = player || {
      id: socket.id
    }
    player.pos = data.pos;
    player.dir = data.dir;
    player.look = data.look;
    if (firstUpdate) {
      players.push(player);
      socket.broadcast.to('game').emit('addplayer', player);
    }
  });  
  
});

// update the state of all connected clients
setInterval(function () {
  io.sockets.in('game').emit('gamestate', players);
}, 50);
