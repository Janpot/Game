

// Base class for a game
var Game;
module.exports = Game = function (cfg) {
  
  this.objects = [];
  
  this.players = [];
  
  this.walls = [];

};


// adds a GameObject to this game 
Game.prototype.addObject = function (gameObject) {
  gameObject.initialize(this);
  this.objects.push(gameObject);
};

// removes a GameObject from this game 
Game.prototype.removeObject = function (toRemove) {
  toRemove.expired = true;
};

// updates the objects in this game
Game.prototype.updateObjects = function (delta, now) {
  this.objects = this.objects.filter(function (object) {
    if (object.expired) {
      object.destroy();
      return false;
    } else {
      return true;
    }
  });
  for (var i = 0; i < this.objects.length; i++) {
    this.objects[i].update(delta, now);    
  }
};


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
