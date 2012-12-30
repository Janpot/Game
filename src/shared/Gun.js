var GameObject = require('./GameObject');
var Shot = require('./Shot');
var twoD = require('./twoD');

var Gun;
module.exports = Gun = function (factory) {
  GameObject.call(this, factory);
  
  this.position = new twoD.Vector();
  this.direction = new twoD.Vector();
  
  this.triggerPulled = false;

  this.firingRate = 150; // ms
  this.timeOfNextShot = 0;
  
  this.firing = false;
  this.shot = new Shot();
};

Gun.prototype = Object.create(GameObject.prototype);

Gun.prototype.initialize = function (game) {
  GameObject.prototype.initialize.call(this, game);
};

Gun.prototype.update = function (delta, now) {
  GameObject.prototype.update.call(this, delta, now);
  
  if (!this.triggerPulled || now < this.timeOfNextShot) {
    this.firing = false;
  } else if (this.triggerPulled) {
    this.firing = true;
    this.timeOfNextShot = now + this.firingRate;
  }
  
  if (this.firing) {
    this.shot.calculate(this.position, this.direction, this.game);
  }  
};