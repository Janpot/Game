var twoD = require('./twoD');
var dynamics = require('./dynamics');

var MAX_DISTANCE = 10000;

var Shot;
module.exports = Shot = function () {
  this.origin = new twoD.Vector();
  this.track = new twoD.Vector();               
};

Shot.prototype.calculate = function (origin, direction, game) {
  this.origin.copy(origin);
  this.track.copy(direction)
            .normalize()
            .multiplyScalar(MAX_DISTANCE);
  
  // collide this shot with the walls
  var s = dynamics.collidePointWalls(this.origin, this.track, game);  
  if (s) {
    this.track.multiplyScalar(s);
  }  
};