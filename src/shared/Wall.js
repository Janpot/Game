var utils = require('./utils.js');
var twoD = require('./twoD');

// Describes a wall in the world, a wall is basically a 2D polygon in the XYplane
var Wall = module.exports = function (cfg) {

  // corners of the wall in 2D space
  this.corners = cfg.corners; 
  
  // bounding box of the wall in 2D space
  this.bounds = new twoD.Rectangle();
  
  // the collection of hidden areas as rays in 2D space
  this.hidden = [];  
  
  // each hidden area consists of 2 2D rays in the XY plane
  // initialize the objects up front for performance
  for (var i = 0; i < this.corners.length; i++) {
    var corner1 = this.corners[i];
    var corner2 = this.corners[(i + 1) % this.corners.length];
    this.hidden.push({
      ray1: {
        origin: corner1,
        wallDir: corner2.clone().subSelf(corner1),
        hiddenDir: new twoD.Vector(0, 0)
      }, 
      ray2: {
        origin: corner2,
        wallDir: corner1.clone().subSelf(corner2),
        hiddenDir: new twoD.Vector(0, 0)
      }
    });
  } 
  
  // calculate bounds
  for (var i = 0; i < this.corners.length; i++) {
    this.bounds.addPoint(this.corners[i].x, this.corners[i].y);
  }
  
};

// set the position from where to calculate the hidden area
Wall.prototype.setHidden = function (position) {
  for (var i = 0; i < this.hidden.length; i++) {
    var ray1 = this.hidden[i].ray1;
    var ray2 = this.hidden[i].ray2;
    
    ray1.hiddenDir
      .copy(ray1.origin)
      .subSelf(position)
      .normalize();
    
    ray2.hiddenDir
      .copy(ray2.origin)
      .subSelf(position)
      .normalize();
  }
};

// returns whether this wall hides the object at position
Wall.prototype.hides = function(position) {
  for (var i = 0; i < this.hidden.length; i++) {
    var ray1 = this.hidden[i].ray1;
    var ray2 = this.hidden[i].ray2;    
    var pos1 = position.clone().subSelf(ray1.origin);
    var pos2 = position.clone().subSelf(ray2.origin);
    var inside1 = utils.isBetweenVectors(ray1.wallDir, ray1.hiddenDir, pos1);
    var inside2 = utils.isBetweenVectors(ray2.wallDir, ray2.hiddenDir, pos2);
    if (inside1 && inside2) {
      return true;
    }
  }
  return false;
};