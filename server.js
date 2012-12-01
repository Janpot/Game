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

// holds the state of the current game
var game = {
  players: {}
};
 
io.sockets.on('connection', function(socket) {
  // a client has connected
  
  var player;  
  
  // initialize the client
  socket.emit('init', game);
  socket.join('game');
  
  socket.on('disconnect', function () {
    // a client has left
    socket.leave('game');
    socket.broadcast.to('game').emit('removeplayer', player);
    delete game.players[socket.id];
  });  
  
  socket.on('playerstate', function (remote) {
    // the client updates its state
    var firstUpdate = player === undefined;
    
    player = remote;
    player.id = socket.id      
    player.lastUpdate = Date.now();
    
    game.players[socket.id] = player;
    if (firstUpdate) {
      socket.broadcast.to('game').emit('addplayer', player);
    }
  });  
  
});

// update the state of all connected clients
setInterval(function () {
  var now = Date.now();
  for (var playerid in game.players) {
    var player = game.players[playerid];
    player.delta = player.lastUpdate - now;
  }
  io.sockets.in('game').emit('gamestate', game);
}, 50);
