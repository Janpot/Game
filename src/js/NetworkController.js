var game = game || {};

game.NetworkController = (function () {
  
  var NetworkController = function (world) {
    this.world = world;
    
    var socket = io.connect('http://localhost');
    socket.on('connect', function () {
      console.log(socket.socket.sessionid);      
      
      setInterval(function() {
        socket.emit('playerstate', {
          position: {
            x: this.world.player.position.x,
            y: this.world.player.position.y
          },
          direction: {
            x: this.world.player.walkDir.x,
            y: this.world.player.walkDir.y
          }
        });
      }, 50);
      
      socket.on('addplayer', function(ids) {
        for (var i = 0; i < ids.length; i++) {
          world.addEnemy(ids[i]);
        }
      });
      
      socket.on('removeplayer', function(ids) {
        for (var i = 0; i < ids.length; i++) {
          world.removeEnemy(ids[i]);
        }
      });
      
      socket.on('gamestate', function(players) {
        for (var i = 0; i < world.enemies.length; i++) {
          var enemy = world.enemies[i];
          for (var j = 0; j < players.length; j++) {
            if (enemy.id === players[j].id) {
              enemy.position.set(players[j].pos.x, players[j].pos.y);
              enemy.walkDir.set(players[j].dir.x, players[j].dir.y);
            }
          }
        }
      });
      
    });
  };
  
  return NetworkController;
  
})();