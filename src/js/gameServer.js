var utils = require('./shared/utils.js');
var Player = require('./shared/Player.js');

var Game = exports.Game = function (cfg) {
  this.level = cfg.level;
  this.players = {};
  this.startUpdatingClients();
};

Game.prototype.connectClient = function (socket) {
  
  socket.emit('initialize', this.serializeState());
  
  socket.on('playerstate', utils.bind(this, function (remote) {
    var player = this.players[socket.id];
    if (player === undefined) {
      // first update
      player = new Player(socket.id, { });
      player.socket = socket;
      this.players[socket.id] = player;
    }
    
    player.unserializeState(remote);     
    player.lastUpdate = Date.now();
  }));
  
  socket.on('disconnect', utils.bind(this, function () {
    // the client has left
    if (this.players[socket.id]) {
      delete this.players[socket.id];
    }
  }));
};

Game.prototype.startUpdatingClients = function () {
  setInterval(utils.bind(this, function () {
    // update the clients
    var gameState = this.serializeState();
    for (var playerid in this.players) {
      this.players[playerid].socket.emit('gamestate', gameState);
    }
  }), 50);
};

Game.prototype.serializeState = function () {  
  var players = {};
  var now = Date.now();
  for (var playerid in this.players) {
    var player = this.players[playerid];
    players[playerid] = {
      id: playerid,
      delta: player.lastUpdate - now,
      state: player.serializeState()
    }
  }
  
  return {
    level: this.level,
    players: players
  }
};
  
  
  
var games = {};

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
//         lookDir: {x: 3, y: 4}
//       }
//     },
//     id_of_player_2: {
//       id: 'id_of_player_2',
//       lastUpdate: 1234567,
//       delta: -20,
//       state: {
//         position: {x: 1, y: 2},
//         lookDir: {x: 3, y: 4}
//       }
//     }
//   }
// }

var connectPlayer = function (socket) {  
  socket.on('connectgame', function (id) {
    // player connects to a game
    var game = games[id];
    if (game !== undefined) {     
      game.connectClient(socket);
    }
  });  
};

exports.start = function (io) { 
  io.sockets.on('connection', connectPlayer);  
};

exports.addGame = function (id, game) {
  games[id] = game;
}