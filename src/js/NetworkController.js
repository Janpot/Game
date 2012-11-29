var game = game || {};

// controls the multiplayer aspect of the game
game.NetworkController = (function () {
  
  var NetworkController = function (world, player) {
    this.world = world;
    this.player = player;
    
    this.enemies = {};
    
    // connect to the server
    var socket = io.connect(location.origin);
    this.socket = socket;
    this.socket.on('connect', game.utils.bind(this, this.onConnect));
  };
  
  NetworkController.prototype.onConnect = function() {
    var player = this.player;
    var socket = this.socket;
    var enemies = this.enemies;
    
    player.id = this.socket.socket.sessionid;
    console.log('this is ' + player.id);
      
    // start updating the server with the current state of the player
    var startUpdate = function() {
      setInterval(function() {
        socket.emit('playerstate', {
          pos: {
            x: player.position.x,
            y: player.position.y
          },
          look: {
            x: player.lookDir.x,
            y: player.lookDir.y
          }
        });
      }, 50);
    };
    
    var addPlayer = function (remote) {
      if (remote.id !== player.id) {
        console.log('adding ' + remote.id);
        var enemy = new game.Player({
          color: 0x0000FF
        });        
        enemy.position.copy(remote.pos);
        enemy.lookDir.copy(remote.look);
        enemy.id = remote.id;
        
        enemies[remote.id] = enemy;
        world.addPlayer(enemy);
      }
    };
    
    // called by the server to initialize this client
    socket.on('init', function(game) {
      for (var playerid in game.players) {          
        addPlayer(game.players[playerid]);          
      }
      startUpdate();
    });
    
    // add a player when the server signals a new player has arrived
    socket.on('addplayer', addPlayer);
    
    // remove a player when theserver signals a player has left
    socket.on('removeplayer', function(remote) {
      console.log('removing ' + remote.id);
      var enemy = enemies[remote.id]
      world.removePlayer(enemy);
      delete enemies[remote.id];
    });
    
    // update the enemies when the server sends an update
    // TODO(Jan): create mechanism to buffer the playerstate and play back on a certain
    //            offset time from the server to smooth out movement.
    //            check: http://buildnewgames.com/real-time-multiplayer/
    socket.on('gamestate', function(game) {   
      for (var enemyid in enemies) {
        if (enemyid !== player.id) {
          var enemy = enemies[enemyid];
          var remote = game.players[enemyid];
          enemy.position.copy(remote.pos);
          enemy.lookDir.copy(remote.look);
        }
      }
    });
  };
  
  return NetworkController;
  
})();