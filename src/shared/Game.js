

// Base class for a game
var Game = function (cfg) {
  
  this.players = [];
  
  this.walls = [];

};


module.exports = Game;


Game.prototype.addPlayer = function (player) {
  this.players.push(player);
};

Game.prototype.removePlayer = function (id) {
  var player = this.getPlayer();
  this.players = this.players.filter(function (player) {
    return player.id !== id;
  });
  return player;
};

Game.prototype.getPlayer = function (id) {
  for (var i = 0; i < this.players.length; i++) {
    if (this.players[i].id === id) {
      return this.players[i];
    }
  }
  return undefined;
};