var Player = require('../shared/Player');
var utils = require('../shared/utils');

var ClientPlayer = module.exports = function (id, factory, cfg) {
  Player.call(this, id, factory, cfg);
  
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

ClientPlayer.prototype = Object.create(Player.prototype);

ClientPlayer.prototype.initialize = function(game) {
  Player.prototype.initialize.call(this, game);
  
  this.game.scene.add(this.mesh);
};

ClientPlayer.prototype.render = function(delta, now) {
  Player.prototype.render.call(this, delta, now);
  
  var angle = utils.angleBetweenVector2(new THREE.Vector2(1, 0), this.lookDir);  
  
  // update mesh
  this.mesh.position.set(this.position.x, this.position.y, 0.5);
  this.mesh.rotation.set(0, 0, angle);
};


ClientPlayer.prototype.destroy = function() {
  this.game.scene.remove(this.mesh);
  
  Player.prototype.destroy.call(this);
};

// REMARK(Jan): removed when rendering is done properly
ClientPlayer.prototype.setVisible = function (visible) {
  this.mesh.visible = visible;
};