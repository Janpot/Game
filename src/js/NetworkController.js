var utils = require('./shared/utils.js');
var ClientPlayer = require('./ClientPlayer.js');
var PlayerstateBuffer = require('./PlayerstateBuffer.js');


// controls the multiplayer aspect of the game
var NetworkController = module.exports = function (world, player, socket) {
  this.offset = 100; // ms behind actual state
  
  this.world = world;
  this.player = player;    
  this.enemies = {};
  this.stateBuffers = {};
  
  // connect to the server
  this.socket = socket;
  this.socket.on('gamestate', utils.bind(this, this.updateGameState));
};

// add a player to the game
NetworkController.prototype.addPlayer = function (remote) {
  console.log('adding ' + remote.id);
  var enemy = new ClientPlayer(remote.id, {
    color: 0x0000FF
  });        
  enemy.unserializeState(remote.state);
  enemy.id = remote.id;
  
  this.enemies[remote.id] = enemy;      
  
  var now = window.performance.now();
  this.stateBuffers[remote.id] = new PlayerstateBuffer();
  this.stateBuffers[remote.id].add(now + remote.delta, remote.state);
  world.addPlayer(enemy);
};

// remove a player from the game
NetworkController.prototype.removePlayer = function (id) {
  console.log('removing ' + id);
  var enemy = this.enemies[id]
  this.world.removePlayer(enemy);
  delete this.stateBuffers[id];
  delete this.enemies[id];
};

// update the current state with new info from the server
NetworkController.prototype.updateGameState = function (game) {
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

// update the world with the current state
NetworkController.prototype.update = function (delta) {    
  var offsetNow = window.performance.now() - this.offset;
  for (var enemyid in this.enemies) {
    var enemy = this.enemies[enemyid];
    var state = this.stateBuffers[enemyid].interpolate(offsetNow);      
    enemy.unserializeState(state);      
  }
};