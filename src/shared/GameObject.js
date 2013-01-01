var GameObject;

// Base class for all objects in the game loop. factory can be used to 
// instantiate other game objects. a factory pattern is used to create
// environment specific objects
//
// Lifecycle:
//     1) [initialize] is called when the object is first added to a game
//     2) [update] is called in every cycle ad can be used to advance the 
//        state of this object. Set [expired] to true to end the lifetime
//        of this object. It will then be removed from the game in the
//        subsequent update cycle.
//     3) [destroy] is called when the object is removed from the game. Use
//        it to perform any cleanup operation in the game.
module.exports = GameObject = function (factory) {
  this.factory = factory;
  
  // use this property to expire the object
  this.expired = false;
  
  // use this to signal that this object should be updated in de gameloop
  this.autoUpdate = true;
  
  // indicates where in the gameloop this object should be updated
  // higher priority = updated first
  this.priority = 0;
};

// initializes the object in a game
GameObject.prototype.initialize = function (game) { 
  this.game = game;
};

// update this object in the gameloop
GameObject.prototype.update = function (delta, now) {

};

// render this object in the renderloop
GameObject.prototype.render = function (delta, now) {

};

// called when the object is removed from the game
GameObject.prototype.destroy = function () {
  this.game = null;
};
