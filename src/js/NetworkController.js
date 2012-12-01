var game = game || {};

// controls the multiplayer aspect of the game
game.NetworkController = (function () {
  
  var NetworkController = function (world, player, socket) {
    this.world = world;
    this.player = player;    
    this.enemies = {};
    this.gameState = {};
    
    // connect to the server
    this.socket = socket;
    this.socket.on('connect', game.utils.bind(this, this.onConnect));
  };
  
  NetworkController.prototype.onConnect = function() {
    // called by the server to initialize this client
    this.socket.on('init', game.utils.bind(this, this.onIntialize));
    
    // add a player when the server signals a new player has arrived
    this.socket.on('addplayer', game.utils.bind(this, this.addPlayer));
    
    // remove a player when the server signals a player has left
    this.socket.on('removeplayer', game.utils.bind(this, this.removePlayer));
    
    // update the state when the server sends an update
    this.socket.on('gamestate', game.utils.bind(this, this.updateGameState));
  };
  
  // add a player to the game
  NetworkController.prototype.addPlayer = function (remote) {
    if (remote.id !== this.player.id) {
      console.log('adding ' + remote.id);
      var enemy = new game.Player({
        color: 0x0000FF
      });        
      enemy.setState(remote);
      enemy.id = remote.id;
      
      this.enemies[remote.id] = enemy;
      world.addPlayer(enemy);
    }
  };
  
  // remove a player from the game
  NetworkController.prototype.removePlayer = function (remote) {
    console.log('removing ' + remote.id);
    var enemy = this.enemies[remote.id]
    this.world.removePlayer(enemy);
    delete this.enemies[remote.id];
  };
  
  // initialize the game
  NetworkController.prototype.onIntialize = function (game) {
    for (var playerid in game.players) {          
      this.addPlayer(game.players[playerid]);          
    }
  };
  
  // update the current state with new info from the server
  NetworkController.prototype.updateGameState = function (game) {
    // TODO(Jan): buffer the gameState instead
    this.gameState = game;
  };
  
  // update the world with the current state
  NetworkController.prototype.update = function (delta) {
    // TODO(Jan): interpolate the positions from the buffered state
    //            use an offset to smooth out the animation
    //            check: http://buildnewgames.com/real-time-multiplayer/
    for (var enemyid in this.enemies) {
      var enemy = this.enemies[enemyid];
      var remote = this.gameState.players[enemyid];
      if (remote) {
        enemy.setState(remote);
      }
    }
  };
  
  return NetworkController;
  
})();