var utils = require('../shared/utils.js');
var twoD = require('../shared/twoD');
var ClientPlayer = require('./ClientPlayer.js');
var Controls = require('./Controls.js');
var PlayerstateBuffer = require('../shared/PlayerstateBuffer.js');
var GameController = require('../shared/GameController.js');
var factory = require('./clientFactory');

var UPDATE_INTERVAL = 50; // ms, interval at which to update the server
var ENEMY_OFFSET = 2.5 * UPDATE_INTERVAL; // ms behind actual state
var MAX_BUFFERSIZE = 5 * ENEMY_OFFSET; // ms, size of playerstate buffers

// controls for a player
var EnemiesController;
module.exports = EnemiesController = function (clientGame, clientSocket) {
  GameController.call(this, clientGame);
  
  this.socket = clientSocket;
  this.enemies = {};
  
  this.socket.on('gamestate', utils.bind(this, this.updateGameState)); 
};

EnemiesController.prototype = Object.create(GameController.prototype);

// update the game state according to the controls
EnemiesController.prototype.update = function (delta, now) {
  var offsetNow = now - ENEMY_OFFSET;
  for (var enemyid in this.enemies) {
    var enemy = this.enemies[enemyid];    
    //console.log(enemy.id + ': ' + enemy.health);
    enemy.setBufferedState(offsetNow);  
  }
};

// add a player to the game
EnemiesController.prototype.addPlayer = function (remote) {
  console.log('adding ' + remote.id);
  var enemy = new ClientPlayer(remote.id, factory, {
    color: 0x0000FF,
    buffersize: MAX_BUFFERSIZE,
    state: remote.state,
    autoUpdate: true
  });
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