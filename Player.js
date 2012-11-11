// describes a player in the field
var Player = function (cfg) {
  cfg.position = cfg.position || new THREE.Vector2(0, 0);
  if (cfg.color === undefined) {
    cfg.color = 0xCC0000;
  }
  var material = new THREE.MeshPhongMaterial({ color: cfg.color });
  this.mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5), material);
  this.mesh.position.set(cfg.position.x, cfg.position.y, 0);
};

Player.prototype.move = function(x, y) {
  this.mesh.translateX(x);
  this.mesh.translateY(y);
};

Player.prototype.getPosition = function() {
  return new THREE.Vector2(this.mesh.position.x, this.mesh.position.y);
};