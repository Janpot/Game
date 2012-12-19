var Player = require('../shared/Player.js');
var utils = require('../shared/utils');

var ClientPlayer = module.exports = function (id, cfg) {
  Player.call(this, id, cfg);
  
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

ClientPlayer.prototype.update = function(delta) {
  Player.prototype.update.call(this, delta);
  
  var angle = utils.angleBetweenVector2(new THREE.Vector2(1, 0), this.lookDir);  
  
  // update mesh
  this.mesh.position.set(this.position.x, this.position.y, 0.5);
  this.mesh.rotation.set(0, 0, angle);  
};