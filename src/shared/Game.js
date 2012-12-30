

// Base class for a game
var Game = function (cfg) {
  
  this.objects = [];
  
  this.players = [];
  
  this.walls = [];

};


module.exports = Game;


Game.prototype.addPlayer = function (player) {
  this.players.push(player);
  this.addObject(player);
};

Game.prototype.removePlayer = function (id) {
  var player = this.getPlayer();
  this.players = this.players.filter(function (player) {
    return player.id !== id;
  });
  this.removeObject(player);
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

// adds a GameObject to this game 
Game.prototype.addObject = function (gameObject) {
  this.objects.push(gameObject);
};

// removes a GameObject from this game 
Game.prototype.removeObject = function (toRemove) {
  this.objects = this.objects.filter(function (object) {
    return object !== toRemove;
  });
};

// updates the objects in this game
Game.prototype.updateObjects = function (delta, now) {
  for (var i = 0; i < this.objects.length; i++) {
    var object = this.objects[i];
    if (object.expired) {
      // remove object
      object.destroy();
      this.objects.splice(i, 1);
      i--;
    } else {
      this.objects[i].update(delta, now);
    }
  }
};
