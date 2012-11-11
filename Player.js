// describes a player in the field
var Player = function (position) {
  if (!position) position = new THREE.Vector2(0, 0);
  var material = new THREE.MeshPhongMaterial({ color: 0xCC0000 });
  this.mesh = new THREE.Mesh(new THREE.SphereGeometry(5), material);
  this.mesh.position.set(position.x, position.y, 0);
};

Player.prototype.move = function(x, y) {
  this.mesh.translateX(x);
  this.mesh.translateY(y);
};

Player.prototype.getPosition = function() {
  return new THREE.Vector2(this.mesh.position.x, this.mesh.position.y);
};