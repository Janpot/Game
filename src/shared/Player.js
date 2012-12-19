var utils = require('./utils.js');
var twoD = require('./twoD');

// Describes a player in the field. Provides base methods 
// for manipulating and rendering Players
//
// id: string
// cfg: {
//   speed: number
//   position: twoD.Vector
//   lookDir: twoD.Vector
//   boundingRadius: number
// }
var Player = function (id, cfg) {  
  this.id = id;
  
  // Player speed
  this.speed = cfg.speed || 12; // m/s  
  
  // Current position
  this.position = cfg.position || new twoD.Vector(0, 0);
  
  // Direction the player is looking at (normalized)
  this.lookDir = cfg.lookDir || new twoD.Vector(1, 0);
  
  // radius for a bounding circle for collision detection
  this.boundingRadius = cfg.boundingRadius || 0.5;
};

module.exports = Player;

// returns a serializable object representing the state of this player
Player.prototype.serializeState = function() {
  return {
    position: {
      x: this.position.x,
      y: this.position.y
    },
    lookDir: {
      x: this.lookDir.x,
      y: this.lookDir.y
    }
  }
};

// sets the state of this player to a provided state, same configuration as
// returned from getState()
Player.prototype.unserializeState = function(state) {
  this.position.copy(state.position);
  this.lookDir.copy(state.lookDir);
};


Player.prototype.applyInput = function (input) {
  
};

// Update player state with a timeframe of delta
Player.prototype.update = function (delta) {
  
};
