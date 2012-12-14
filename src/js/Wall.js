var utils = require('./utils.js');

// Describes a wall in the world, a wall is basically a 2D polygon in the XYplane
var Wall = module.exports = function (cfg) {

  // corners of the wall in 2D space
  this.corners = cfg.corners; 
  
  // bounding box of the wall in 2D space
  this.bounds = new THREE.Rectangle();
  
  // the collection of hidden areas as rays in 2D space
  this.hidden = [];
  
  // the 3D geometry for the hidden areas
  this.hidingBlocks = [];
  
  
  // each hidden area consists of 2 2D rays in the XY plane
  // initialize the objects up front for performance
  for (var i = 0; i < this.corners.length; i++) {
    var corner1 = this.corners[i];
    var corner2 = this.corners[(i + 1) % this.corners.length];
    this.hidden.push({
      ray1: {
        origin: corner1,
        wallDir: corner2.clone().subSelf(corner1),
        hiddenDir: new THREE.Vector2(0, 0)
      }, 
      ray2: {
        origin: corner2,
        wallDir: corner1.clone().subSelf(corner2),
        hiddenDir: new THREE.Vector2(0, 0)
      }
    });
  }
  
  // create hidden geometry
  for (var i = 0; i < this.corners.length; i++) {    
    var shape = new THREE.Shape([
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(1, 1, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 0)
    ]);
    var mesh = new THREE.Mesh(shape.extrude({amount: 1000, bevelEnabled: false}), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    mesh.doubleSided = true;
    this.hidingBlocks.push(mesh);
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
    
    // update rays for debugging
    var length = 1000;
    var end1 = ray1.hiddenDir.clone().multiplyScalar(length).addSelf(ray1.origin);
    var end2 = ray2.hiddenDir.clone().multiplyScalar(length).addSelf(ray2.origin);  
    
    
    var block = this.hidingBlocks[i].geometry;
    var height = 1000;
    block.vertices[0].set(ray1.origin.x, ray1.origin.y, 0);    
    block.vertices[1].set(end1.x, end1.y, 0);
    block.vertices[2].set(end2.x, end2.y, 0);
    block.vertices[3].set(ray2.origin.x, ray2.origin.y, 0); 
    block.vertices[4].set(ray1.origin.x, ray1.origin.y, height);    
    block.vertices[5].set(end1.x, end1.y, height);
    block.vertices[6].set(end2.x, end2.y, height);
    block.vertices[7].set(ray2.origin.x, ray2.origin.y, height); 
    block.verticesNeedUpdate = true;  
  }
  
  return this.hidden;
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

// sets the visibility of the walls and the hidingblocks
Wall.prototype.setHidingblocksVisible = function (visible) {
  for (var i = 0; i < this.hidingBlocks.length; i++) {
    this.hidingBlocks[i].visible = visible;
  }
};

