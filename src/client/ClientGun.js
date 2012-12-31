var Gun = require('../shared/Gun');
var twoD = require('../shared/twoD');

var ClientGun;
module.exports = ClientGun = function (factory) {
  Gun.call(this, factory);
  
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

ClientGun.prototype = Object.create(Gun.prototype);

ClientGun.prototype.initialize = function (game) {
  Gun.prototype.initialize.apply(this, arguments);
  
  this.game.scene.add(this.line); 
};

ClientGun.prototype.render = function (delta, now) {
  Gun.prototype.render.apply(this, arguments);
  
  if (this.firing) {
    this.twoDEnd.copy(this.shot.origin)
                .addSelf(this.shot.track);
                
    this.begin.set(this.shot.origin.x, this.shot.origin.y, 1);
    this.end.set(this.twoDEnd.x, this.twoDEnd.y, 1);
    this.geometry.verticesNeedUpdate = true; 
    this.line.visible = true;
  } else {
    this.line.visible = false;
  }
};

ClientGun.prototype.destroy = function () {
  this.game.scene.remove(this.line); 
  
  Gun.prototype.destroy.apply(this, arguments);
};