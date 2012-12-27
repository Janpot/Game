var GameController = require('../shared/GameController.js');
var Player = require('../shared/Player.js');
var utils = require('../shared/utils.js');

// interval at which to update the clients
var UPDATE_INTERVAL = 50;


// Controller for a player on the server
var ServerGameController;
module.exports = ServerGameController = function (serverGame, serverSocket) {
  GameController.call(this, serverGame);
  
  this.socket = serverSocket;
  
  this.player = new Player(this.socket.id, this.game, { });
  this.game.addPlayer(this.player);
  
  this.socket.on('playerstate', utils.bind(this, this.handlePlayerstate));
  
  this.updateInterval = setInterval(utils.bind(this, this.updateClient), UPDATE_INTERVAL);
  
  // initialize the client
  this.socket.emit('initialize', this.game.serializeState());
};

ServerGameController.prototype = Object.create(GameController.prototype);

ServerGameController.prototype.handlePlayerstate = function (remote) {
  this.player.unserializeState(remote);     
  this.player.lastUpdate = Date.now();
};

ServerGameController.prototype.updateClient = function () {
  var gameState = this.game.serializeState();
  this.socket.emit('gamestate', gameState);
};

ServerGameController.prototype.destroy = function () {
  this.game.removePlayer(this.socket.id);  
  clearInterval(this.updateInterval);
  this.socket.removeAllListeners();
};