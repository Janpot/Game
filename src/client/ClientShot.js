var Shot = require('../shared/Shot');
var twoD = require('../shared/twoD');

var ClientShot;
module.exports = ClientShot = function (factory) {
  Shot.call(this, factory);
  
  var material = new THREE.LineBasicMaterial({
      color: 0x000000,
  });
  
  this.begin = new THREE.Vector3();
  this.end = new THREE.Vector3();
  this.twoDEnd = new twoD.Vector();
  
  this.geometry = new THREE.Geometry();
  this.geometry.vertices.push(this.begin);
  this.geometry.vertices.push(this.end);
  
  this.line = new THREE.Line(this.geometry, material);
};

ClientShot.prototype = Object.create(Shot.prototype);

ClientShot.prototype.initialize = function (game) {
  Shot.prototype.initialize.call(this, game);
  
  this.game.scene.add(this.line); 
};

ClientShot.prototype.update = function (delta, now) {
  Shot.prototype.update.call(this, delta, now);
  
  this.twoDEnd.copy(this.direction)
              .normalize()
              .multiplyScalar(this.distance)
              .addSelf(this.position);
  
  this.begin.set(this.position.x, this.position.y, 1);
  this.end.set(this.twoDEnd.x, this.twoDEnd.y, 1);
  this.geometry.verticesNeedUpdate = true; 
};

ClientShot.prototype.destroy = function () {
  this.game.scene.remove(this.line); 
  
  Shot.prototype.destroy.call(this);
};

// REMARK(Jan): removed when rendering is done properly
ClientShot.prototype.setVisible = function (visible) {
  this.line.visible = visible;
};