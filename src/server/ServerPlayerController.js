var GameController = require('../shared/GameController.js');
var Player = require('../shared/Player.js');
var utils = require('../shared/utils.js');
var factory = require('./serverFactory');

// interval at which to update the clients
var CLIENT_UPDATE_INTERVAL = 50;
var PHYSICS_DELTA = 16; // ms, delta to simulate game on the server


// Controller for a player on the server
var ServerPlayerController;
module.exports = ServerPlayerController = function (serverGame, serverSocket) {
  GameController.call(this, serverGame);
  
  this.socket = serverSocket;
  
  this.player = new Player(this.socket.id, this.game, { });
  this.game.addPlayer(this.player);
  
  this.socket.on('playerinput', utils.bind(this, this.handlePlayerinput));
  
  this.updateInterval = setInterval(utils.bind(this, this.updateClient), CLIENT_UPDATE_INTERVAL);
  
  // initialize the client
  var initialGamestate = this.serializeGame();
  initialGamestate.level = this.game.level;
  this.socket.emit('initialize', initialGamestate);
};

ServerPlayerController.prototype = Object.create(GameController.prototype);

ServerPlayerController.prototype.handlePlayerstate = function (remote) {
  this.player.unserializeState(remote);     
  this.player.lastUpdate = Date.now();
};

ServerPlayerController.prototype.serializeGame = function () {
  // serialize the game
  var enemies = {};
  var now = Date.now();
  for (var i = 0; i < this.game.players.length; i++) {
    var enemy = this.game.players[i];
    if (enemy !== this.player) {
      enemies[enemy.id] = {
        id: enemy.id,
        delta: enemy.lastServerUpdate - now,
        state: enemy.serializeState()
      }
    }
  }
  
  return {
    level: this.level,
    enemies: enemies,
    player: {
      state: this.player.serializeState(),
      updateTime: this.player.lastClientUpdate
    }
  };
};

ServerPlayerController.prototype.updateClient = function () {
  // send state
  this.socket.emit('gamestate', this.serializeGame());
};

ServerPlayerController.prototype.destroy = function () {
  this.game.removePlayer(this.socket.id);  
  clearInterval(this.updateInterval);
  this.socket.removeAllListeners();
};


ServerPlayerController.prototype.handlePlayerinput = function (data) {
  var delta = PHYSICS_DELTA / 1000;
  var now = Date.now();
  var updateCount = data.buffer.length;
  for (var i = 0; i < updateCount; i++) {
    var timeOfInput = now - (updateCount - i - 1) * PHYSICS_DELTA;
    var input = data.buffer[i];
    
    this.player.applyInput(input);
    this.player.updatePosition(delta);
    this.player.gun.update(delta, timeOfInput);
    if (this.player.gun.firing) {
      console.log(this.player.id + ' is firing'); 
    }
  }  
  
  this.player.lastClientUpdate = data.clientTime;
  this.player.lastServerUpdate = Date.now();
};