var game = game || {};

// controls the multiplayer aspect of the game
game.NetworkController = (function () {
  
  var NetworkController = function (world) {
    this.world = world;
    
    // connect to the server
    var socket = io.connect(location.origin);
    socket.on('connect', function () {  
      
      // start updating the server with the current state of the player
      var startUpdate = function() {
        setInterval(function() {
          socket.emit('playerstate', {
            pos: {
              x: this.world.player.position.x,
              y: this.world.player.position.y
            },
            look: {
              x: this.world.player.lookDir.x,
              y: this.world.player.lookDir.y
            }
          });
        }, 50);
      };
      
      var addPlayer = function (player) {
        var enemy = world.addEnemy(player.id);
        enemy.position.copy(player.pos);
        enemy.lookDir.copy(player.look);
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
      socket.on('removeplayer', function(player) {
        world.removeEnemy(player.id);
      });
      
      // update the enemies when the server sends an update
      // TODO(Jan): create mechanism to buffer the playerstate and play back on a certain
      //            offset time from the server to smooth out movement.
      //            check: http://buildnewgames.com/real-time-multiplayer/
      socket.on('gamestate', function(game) {        
        for (var i = 0; i < world.enemies.length; i++) {
          var enemy = world.enemies[i];
          var remote = game.players[enemy.id];
          enemy.position.copy(remote.pos);
          enemy.lookDir.copy(remote.look);
        }
      });
      
    });
  };
  
  return NetworkController;
  
})();