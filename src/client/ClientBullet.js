var Bullet = require('../shared/Bullet');

var ClientBullet;
module.exports = ClientBullet = function (factory, position, direction) {
  Bullet.call(this, factory, position, direction)
  
  this.mesh = new THREE.Mesh(new THREE.CubeGeometry(0.5, 0.5, 1.5), new THREE.MeshPhongMaterial({color: 0x1BE322}));
  this.mesh.position.set(this.position.x, this.position.y, 1);
  var lookAt = new THREE.Vector2().add(this.position,this.direction);
  this.mesh.lookAt(new THREE.Vector3(lookAt.x,lookAt.y,1));
};

ClientBullet.prototype = Object.create(Bullet.prototype);

ClientBullet.prototype.initialize = function (game) {
  Bullet.prototype.initialize.call(this, game);
  
  this.game.scene.add(this.mesh); 
};

ClientBullet.prototype.update = function (delta, now) {
  Bullet.prototype.update.call(this, delta, now);
  
  this.mesh.position.set(this.position.x, this.position.y, 1);  
};

ClientBullet.prototype.destroy = function () {
  this.game.scene.remove(this.mesh); 
  
  Bullet.prototype.destroy.call(this);
};

// REMARK(Jan): removed when rendering is done properly
ClientBullet.prototype.setVisible = function (visible) {
  this.mesh.visible = visible;
};