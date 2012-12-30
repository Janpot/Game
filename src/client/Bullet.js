var Bullet = module.exports = function (position, direction) {
  this.position = position;
  this.speed = 45; // m/s
  this.direction = direction;
  
  this.expiringTime;
  this.lifeTime = 2000; // ms
  
  this.mesh = new THREE.Mesh(new THREE.CubeGeometry(0.5, 0.5, 1.5), new THREE.MeshPhongMaterial({color: 0x1BE322}));
  this.mesh.position.set(this.position.x, this.position.y, 1);
  var lookAt = new THREE.Vector2().add(this.position,this.direction);
  this.mesh.lookAt(new THREE.Vector3(lookAt.x,lookAt.y,1));
};

Bullet.prototype.update = function (delta, now) {
  if (!this.expiringTime) {
    this.expiringTime = now + this.lifeTime;
  } else if (now > this.expiringTime) {
    this.expired = true;
  }
  
  this.position.addSelf(this.direction.normalize().multiplyScalar(delta * this.speed));
  this.mesh.position.set(this.position.x, this.position.y, 1);
  
};