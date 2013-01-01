var utils = require('./utils');

var PHYSICS_LOOP = 16; // ms

// Base class for a game
var Game;
module.exports = Game = function (cfg) {
  
  this.objects = [];
  
  this.players = [];
  
  this.walls = [];

};

Game.prototype.start = function () {  
  // start gameloop
  setInterval(utils.bind(this, function() {
    var now = Date.now();
    var delta = PHYSICS_LOOP / 1000;
    this.update(delta, now);
  }), PHYSICS_LOOP);
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
Game.prototype.update = function (delta, now) {
  this.objects = this.objects.filter(function (object) {
    if (object.expired) {
      object.destroy();
      return false;
    } else {
      return true;
    }
  });
  this.objects.sort(function () {
    return -this.priority;
  });
  for (var i = 0; i < this.objects.length; i++) {
    var object = this.objects[i];
    if (object.autoUpdate) {
      object.update(delta, now);
    }   
  }
};

// updates the objects in this game
Game.prototype.render = function (delta, now) {
  for (var i = 0; i < this.objects.length; i++) {
    var object = this.objects[i];
    object.render(delta, now);
  }
};


Game.prototype.addPlayer = function (player) {
  this.addObject(player);
  this.players.push(player);
};

Game.prototype.removePlayer = function (id) {
  var player = this.getPlayer(id);
  this.removeObject(player);
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
