

// Base class for a game
var Game;
module.exports = Game = function (cfg) {
  
  this.updatedObjects = [];
  
  this.players = [];
  
  this.walls = [];

};


// adds a GameObject to this game 
Game.prototype.addObjectToLoop = function (gameObject) {
  gameObject.initialize(this);
  this.updatedObjects.push(gameObject);
};

// removes a GameObject from this game 
Game.prototype.removeObjectFromLoop = function (toRemove) {
  toRemove.expired = true;
};

// updates the objects in this game
Game.prototype.updateObjects = function (delta, now) {
  this.updatedObjects = this.updatedObjects.filter(function (object) {
    if (object.expired) {
      object.destroy();
      return false;
    } else {
      return true;
    }
  });
  for (var i = 0; i < this.updatedObjects.length; i++) {
    this.updatedObjects[i].update(delta, now);    
  }
};


Game.prototype.addPlayer = function (player) {
  this.players.push(player);
  this.addObjectToLoop(player);
};

Game.prototype.removePlayer = function (id) {
  var player = this.getPlayer(id);
  this.players = this.players.filter(function (player) {
    return player.id !== id;
  });
  this.removeObjectFromLoop(player);
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
