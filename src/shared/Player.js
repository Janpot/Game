var utils = require('./utils');
var twoD = require('./twoD');
var dynamics = require('./dynamics');
var Gun = require('./Gun');
var PlayerstateBuffer = require('../shared/PlayerstateBuffer');

// Describes a player in the field. Provides base methods 
// for manipulating and rendering Players
//
// id: string
// cfg: {
//   speed: number,
//   state: {
//     position: twoD.Vector,
//     lookDir: twoD.Vector
//   },
//   boundingRadius: number
// }
var Player = function (id, world, cfg) {  
  var cfg = cfg || {};
  cfg.state = cfg.state || {};
  
  this.id = id;
  
  this.world = world;
  
  // Player speed
  this.speed = cfg.speed || 12; // m/s  
  
  // Current position
  this.position = new twoD.Vector(0, 0);
  if (cfg.state.position) {
    this.position.copy(cfg.state.position)
  }
  
  // Direction the player is walking
  this.walkDir = new twoD.Vector(0, 0);
  
  // Direction the player is looking at (normalized)
  this.lookDir = new twoD.Vector(1, 0);
  if (cfg.state.lookDir) {
    this.lookDir.copy(cfg.state.lookDir)
  }
  
  // radius for a bounding circle for collision detection
  this.boundingRadius = cfg.boundingRadius || 0.5;
  
  // buffer can that store past states
  if (cfg.buffersize) {
    this.stateBuffer = new PlayerstateBuffer(cfg.buffersize);
  }
  
  this.gun = new Gun();
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

// Sets the player to a state in the buffer at [time]
Player.prototype.setBufferedState = function(time) {
  var state = this.stateBuffer.get(time);      
  this.unserializeState(state);  
};

// Update player state with a timeframe of delta
Player.prototype.update = function (delta) {
  
};

// Update player position according to his walking direction
Player.prototype.updatePosition = function (delta) {
  distance = this.speed * delta;
  var track = this.walkDir.clone()
                          .normalize()
                          .multiplyScalar(distance);
  
  this.moveAndCollide(track);  
};

// Move the player along track, colide if necessary
Player.prototype.moveAndCollide = function (track) {
  var altTrack = new twoD.Vector();
  // test primary track
  var s = dynamics.collideCircleWorld(
    this.position, this.boundingRadius, 
    track, 
    this.world,
    altTrack
  );
  
  // move player
  if (s === undefined) {
    this.position.addSelf(track);
  } else {
    // cut player path
    this.position.addSelf(track.multiplyScalar(s))
      
    // player collided, test alternative track
    s = dynamics.collideCircleWorld(
      this.position, this.boundingRadius, 
      altTrack, 
      this.world
    );
    
    // move player over alternative track
    if (s === undefined) {
      this.position.addSelf(altTrack);
    } else {
      this.position.addSelf(altTrack.multiplyScalar(s))
    }
  } 
};



// Apply an input object from the Controls to this player
Player.prototype.applyInput = function (input, delta) {
  this.walkDir.copy(input.arrows);
  
  this.lookDir.copy(input.mouse)
              .subSelf(this.position)
              .normalize();
              
  this.updatePosition(delta);
  
  this.gun.update(input.leftMouse);
};








