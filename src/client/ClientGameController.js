var utils = require('../shared/utils.js');
var twoD = require('../shared/twoD');
var ClientPlayer = require('./ClientPlayer.js');
var Controls = require('./Controls.js');
var PlayerstateBuffer = require('./PlayerstateBuffer.js');

var ENEMY_OFFSET = 100; // ms behind actual state

// controls for a player
var ClientGameController;
module.exports = ClientGameController = function (clientGame, clientSocket) {
  
  this.width = 0;
  this.height = 0;
  this.socket = clientSocket;
  this.game = clientGame;
  this.player = new ClientPlayer(this.socket.socket.sessionid, this.game, {
    position: new THREE.Vector2(0, 0)
  });
  this.game.addPlayer(this.player);
  this.enemies = {};
  this.stateBuffers = {};  
  this.controls = new Controls(this.game.camera);
  
  this.socket.on('gamestate', utils.bind(this, this.updateGameState));  
  console.log('this is ' + this.player.id);
  this.startSendingState();
  
  
  // TODO(Jan): Remove this when shooting is properly implemented
  var mouseDown = function (e) {
    switch (e.button) {
      case 0: // left
        this.shoot();
        break;
    }
  };
  window.addEventListener('mousedown', utils.bind(this, mouseDown), false);
  // END TODO
};

// update the game state according to the controls
ClientGameController.prototype.update = function (delta) {
  
  var input = this.controls.getInput();  
  this.player.applyInput(input);
  
  // update position
  this.player.updatePosition(delta); 
  
  this.game.setViewPosition(this.player.position);
  
  var offsetNow = window.performance.now() - ENEMY_OFFSET;
  for (var enemyid in this.enemies) {
    var enemy = this.enemies[enemyid];
    var state = this.stateBuffers[enemyid].interpolate(offsetNow);      
    enemy.unserializeState(state);      
  }
};

// let the player shoot
ClientGameController.prototype.shoot = function () {
  this.game.addBullet(this.player.position.clone(), this.player.lookDir.clone());
};
   

// set up the loop for sending the player's state to the server
ClientGameController.prototype.startSendingState = function () {
  setInterval(utils.bind(this, this.sendState), 50);
};

// Send the player's state to the server
ClientGameController.prototype.sendState = function () {
  this.socket.emit('playerstate', this.player.serializeState());
};


// set size of the viewport
ClientGameController.prototype.setSize = function(width, height) {
  this.controls.setSize(width, height);
};


// add a player to the game
ClientGameController.prototype.addPlayer = function (remote) {
  console.log('adding ' + remote.id);
  var enemy = new ClientPlayer(remote.id, this.game, {
    color: 0x0000FF
  });        
  enemy.unserializeState(remote.state);
  enemy.id = remote.id;
  
  this.enemies[remote.id] = enemy;      
  
  var now = window.performance.now();
  this.stateBuffers[remote.id] = new PlayerstateBuffer();
  this.stateBuffers[remote.id].add(now + remote.delta, remote.state);
  this.game.addPlayer(enemy);
};

// remove a player from the game
ClientGameController.prototype.removePlayer = function (id) {
  console.log('removing ' + id);
  var enemy = this.enemies[id]
  this.game.removePlayer(id);
  delete this.stateBuffers[id];
  delete this.enemies[id];
};

// update the current state with new info from the server
ClientGameController.prototype.updateGameState = function (game) {
  for (var enemyid in this.enemies) {
    var remote = game.players[enemyid];
    if (remote === undefined) {
      // this player has left, remove him
      this.removePlayer(enemyid);
    } else {
      // update the buffer of this player
      var now = window.performance.now();
      this.stateBuffers[enemyid].add(now + remote.delta, remote.state);
    }
  }
  
  for (var enemyid in game.players) {
    if (enemyid !== this.player.id && this.enemies[enemyid] === undefined) {
      // this is a new player, add him
      this.addPlayer(game.players[enemyid]);
    }
  }
};