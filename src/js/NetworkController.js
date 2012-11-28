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
            dir: {
              x: this.world.player.walkDir.x,
              y: this.world.player.walkDir.y
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
        enemy.walkDir.copy(player.dir);
        enemy.lookDir.copy(player.look);
      };
      
      // called by the server to initialize this client
      socket.on('init', function(players) {
        for (var i = 0; i < players.length; i++) {
          addPlayer(players[i]);
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
      socket.on('gamestate', function(players) {        
        for (var i = 0; i < world.enemies.length; i++) {
          var enemy = world.enemies[i];
          for (var j = 0; j < players.length; j++) {
            if (enemy.id === players[j].id) {
              enemy.position.copy(players[j].pos);
              enemy.walkDir.copy(players[j].dir);
              enemy.lookDir.copy(players[j].look);
            }
          }
        }
      });
      
    });
  };
  
  return NetworkController;
  
})();