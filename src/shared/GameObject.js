var GameObject;

module.exports = GameObject = function (game) {
  this.game = game;
  
  // use this property to expire the object
  this.expired = false;
};

// update this object in the gameloop
GameObject.prototype.update = function (delta, now) { };

// called when the object is removed from the game
GameObject.prototype.destroy = function () { };
