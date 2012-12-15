var utils = require('./shared/utils');

// describes a player in the field
var Player = module.exports = function (cfg) {
  
  // Player speed
  this.speed = 12; // m/s
  
  // Current position
  this.position = cfg.position || new THREE.Vector2(0, 0);
  
  // Direction the player is looking at (normalized)
  this.lookDir = new THREE.Vector2(1, 0);
  
  // radius for a bounding circle for collision detection
  this.boundingRadius = 0.5;
  
  
  if (cfg.color === undefined) {
    cfg.color = 0xCC0000;
  }
  var material = new THREE.MeshPhongMaterial({ color: cfg.color });
  var shape = new THREE.Shape();
  shape.fromPoints([
    new THREE.Vector3(1, 0, 0), 
    new THREE.Vector3(-0.5, -0.5, 0),
    new THREE.Vector3(-0.5, 0.5, 0)
  ]);  
  this.mesh = new THREE.Mesh(shape.extrude({amount: 1, bevelEnabled: false}), material);
  
  this.mesh.position.set(this.position.x, this.position.y, 0.5);
  
};

// Update player state with a timeframe of delta
Player.prototype.update = function(delta) {
  var angle = utils.angleBetweenVector2(new THREE.Vector2(1, 0), this.lookDir);  
  
  // update mesh
  this.mesh.position.set(this.position.x, this.position.y, 0.5);
  this.mesh.rotation.set(0, 0, angle);  
};

// returns a serializable object representing the state of this player
Player.prototype.getState = function() {
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
  // TODO(jan): Use this in the networkcontroller
};

// sets the state of this player to a provided state, same configuration as
// returned from getState()
Player.prototype.setState = function(state) {
  this.position.copy(state.position);
  this.lookDir.copy(state.lookDir);
};
