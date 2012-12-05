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

// Example gamestate:
// ------------------
//
// game = {
//   players: {
//     id_of_player_1: {
//       id: 'id_of_player_1', // the id
//       lastUpdate: 1234567,  // last update on the server
//       delta: -20,           // delta from the time this object was sent to the client
//       state: {              // the state
//         position: {x: 1, y: 2},
//         lookDor: {x: 3, y: 4}
//       }
//     },
//     id_of_player_2: {
//       id: 'id_of_player_2',
//       lastUpdate: 1234567,
//       delta: -20,
//       state: {
//         position: {x: 1, y: 2},
//         lookDor: {x: 3, y: 4}
//       }
//     }
//   }
// }

var updateDeltas = function() {
  var now = Date.now();
  for (var playerid in game.players) {
    var player = game.players[playerid];
    player.delta = player.lastUpdate - now;
  }
};
 
io.sockets.on('connection', function(socket) {
  // a client has connected
  
  var player;
  
  socket.on('disconnect', function () {
    // the client has left
    delete game.players[socket.id];
  });  
  
  socket.on('playerstate', function (remote) {
    // update the game on the server
    player = player || {};
    player.id = socket.id;
    player.state = remote;     
    player.lastUpdate = Date.now();    
    game.players[socket.id] = player;
  });
  
  setInterval(function () {
    // update the client
    updateDeltas();
    socket.emit('gamestate', game);
  }, 50);
  
});
