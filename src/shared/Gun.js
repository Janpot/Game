var Gun;
module.exports = Gun = function () {
  this.triggerPulled = false;

  this.firingRate = 150; // ms
  this.timeOfNextShot = 0;
  
  this.shot = false;
};


Gun.prototype.update = function (pulled) {  
  
  var now = Date.now();
  
  if (!pulled || now < this.timeOfNextShot) {
    this.shot = false;
  } else {
    this.shot = true;
    this.timeOfNextShot = now + this.firingRate;
  }
  
};