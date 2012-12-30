var GameObject = require('./GameObject');
var twoD = require('./twoD');

var Gun;
module.exports = Gun = function (factory) {
  GameObject.call(this, factory);
  
  this.position = new twoD.Vector();
  this.direction = new twoD.Vector();
  
  this.triggerPulled = false;

  this.firingRate = 150; // ms
  this.timeOfNextShot = 0;
  
  this.shot = false;
};

Gun.prototype = Object.create(GameObject.prototype);

Gun.prototype.initialize = function (game) {
  GameObject.prototype.initialize.call(this, game);
};

Gun.prototype.update = function (delta, now) {
  GameObject.prototype.update.call(this, delta, now);
  
  if (!this.triggerPulled || now < this.timeOfNextShot) {
    this.shot = false;
  } else if (this.triggerPulled) {
    this.shot = true;
    this.timeOfNextShot = now + this.firingRate;
  }
  
  if (this.shot) {
    var bullet = new this.factory.Bullet(this.factory, this.position, this.direction);
    this.game.addObject(bullet);
  }
  
};