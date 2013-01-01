var GameObject = require('../shared/GameObject');
var utils = require('../shared/utils');
var twoD = require('../shared/twoD');
var ClientPlayer = require('./ClientPlayer');
var Controls = require('./Controls');
var PlayerstateBuffer = require('../shared/PlayerstateBuffer');

var UPDATE_INTERVAL = 50; // ms, interval at which to update the server
var ENEMY_OFFSET = 2.5 * UPDATE_INTERVAL; // ms behind actual state
var MAX_BUFFERSIZE = 5 * ENEMY_OFFSET; // ms, size of playerstate buffers

// controls for a player
var EnemiesController;
module.exports = EnemiesController = function (factory, clientSocket) {
  GameObject.call(this, factory);
  
  this.socket = clientSocket;
  this.enemies = {};
};

EnemiesController.prototype = Object.create(GameObject.prototype);


EnemiesController.prototype.initialize = function (game) {
  GameObject.prototype.initialize.apply(this, arguments);
  
  this.socket.on('gamestate', utils.bind(this, this.updateGameState)); 
};

// update the game state according to the controls
EnemiesController.prototype.update = function (delta, now) {
  GameObject.prototype.update.apply(this, arguments);
  var offsetNow = now - ENEMY_OFFSET;
  for (var enemyid in this.enemies) {
    var enemy = this.enemies[enemyid];
    enemy.setBufferedState(offsetNow);  
  }
};

// add a player to the game
EnemiesController.prototype.addPlayer = function (remote) {
  console.log('adding ' + remote.id);
  var enemy = new ClientPlayer(remote.id, this.factory, {
    color: 0x0000FF,
    buffersize: MAX_BUFFERSIZE,
    state: remote.state
  });
  enemy.autoUpdate = false;
  enemy.priority = this.priority - 1;
  this.enemies[remote.id] = enemy;
  this.game.addPlayer(enemy);
  
  var now = Date.now();
  enemy.stateBuffer.add(remote.state, now + remote.delta);
};

// remove a player from the game
EnemiesController.prototype.removePlayer = function (id) {
  console.log('removing ' + id);
  var enemy = this.enemies[id];
  this.game.removePlayer(id);
  delete this.enemies[id];
};

// update the current state with new info from the server
EnemiesController.prototype.updateGameState = function (game) {
  for (var enemyid in this.enemies) {
    var remote = game.enemies[enemyid];
    if (remote === undefined) {
      // this player has left, remove him
      this.removePlayer(enemyid);
    } else {
      // update the buffer of this player
      var now = Date.now();      
      this.enemies[enemyid].stateBuffer.add(remote.state, now + remote.delta);
    }
  }
  
  for (var enemyid in game.enemies) {
    if (this.enemies[enemyid] === undefined) {
      // this is a new player, add him
      this.addPlayer(game.enemies[enemyid]);
    }
  }
};