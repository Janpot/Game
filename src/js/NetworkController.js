var game = game || {};

// controls the multiplayer aspect of the game
game.NetworkController = (function () {
  
  
  // A buffer to store the state for a player so it can be played back
  // with an offset to keep the animation smooth
  var PlayerStateBuffer = function () {
    this.buffer = []; // keep at least 1 element
    this.maxOffset = 1000; // maximum offset to keep in the buffer
  };
  
  // add a state to the buffer
  PlayerStateBuffer.prototype.add = function (time, state) {
    this.buffer.push({
      time: time,
      state: state
    });
    // clean the end of the buffer
    while (this.buffer.length > 1 && this.buffer[0].time < time - this.maxOffset) {
      this.buffer.splice(0, 1);
    }
  };
  
  // interpolate 2 playerstates by a factor s
  PlayerStateBuffer.prototype.interpolateStates = function (state1, state2, s) {
    return {
      position: {
        x: game.utils.interpolate(state1.position.x, state2.position.x, s),
        y: game.utils.interpolate(state1.position.y, state2.position.y, s)
      },
      lookDir: {
        x: game.utils.interpolate(state1.lookDir.x, state2.lookDir.x, s),
        y: game.utils.interpolate(state1.lookDir.y, state2.lookDir.y, s)
      }
    }
  };
  
  // interpolate a state from the buffer with the desired time
  PlayerStateBuffer.prototype.interpolate = function (time) {    
    var length = this.buffer.length;
    if (time <= this.buffer[0].time) {
      return this.buffer[0].state;
    } else if (time >= this.buffer[length - 1].time) {
      return this.buffer[length - 1].state;
    } else {
      var idx = 0;
      while (this.buffer[idx + 1].time < time) {
        idx += 1;
      }
      var s = (time - this.buffer[idx].time) / (this.buffer[idx + 1].time - this.buffer[idx].time);
      return this.interpolateStates(this.buffer[idx].state, this.buffer[idx + 1].state, s);
    }
  };
  
  
  
  
  
  var NetworkController = function (world, player, socket) {
    this.offset = 100; // ms behind actual state
    
    this.world = world;
    this.player = player;    
    this.enemies = {};
    this.stateBuffers = {};
    
    // connect to the server
    this.socket = socket;
    this.socket.on('connect', game.utils.bind(this, this.onConnect));
  };
  
  NetworkController.prototype.onConnect = function() {
    // called by the server to initialize this client
    this.socket.on('init', game.utils.bind(this, this.onIntialize));
    
    // add a player when the server signals a new player has arrived
    /*this.socket.on('addplayer', game.utils.bind(this, this.addPlayer));*/
    
    // update the state when the server sends an update
    this.socket.on('gamestate', game.utils.bind(this, this.updateGameState));
  };
  
  // add a player to the game
  NetworkController.prototype.addPlayer = function (remote) {
    console.log('adding ' + remote.id);
    var enemy = new game.Player({
      color: 0x0000FF
    });        
    enemy.setState(remote.state);
    enemy.id = remote.id;
    
    this.enemies[remote.id] = enemy;      
    
    var now = window.performance.now();
    this.stateBuffers[remote.id] = new PlayerStateBuffer();
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
  
  // initialize the game
  NetworkController.prototype.onIntialize = function (game) {
    for (var playerid in game.players) {          
      this.addPlayer(game.players[playerid]);          
    }
  };
  
  // update the current state with new info from the server
  NetworkController.prototype.updateGameState = function (game) {
    for (var enemyid in this.enemies) {
      var remote = game.players[enemyid];
      if (remote === undefined) {
        this.removePlayer(enemyid);
      } else {
        var now = window.performance.now();
        this.stateBuffers[enemyid].add(now + remote.delta, remote.state);
      }
    }
    
    for (var enemyid in game.players) {
      if (enemyid !== this.player.id && this.enemies[enemyid] === undefined) {
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
      enemy.setState(state);      
    }
  };
  
  return NetworkController;
  
})();