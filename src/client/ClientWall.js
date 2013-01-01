var utils = require('../shared/utils');
var Wall = require('../shared/Wall');

// Describes a wall in the world for the client
var ClientWall;
module.exports = ClientWall = function (cfg) {
  Wall.call(this, cfg);
  
  // the 3D geometry for the hidden areas
  this.hidingBlocks = [];
  
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
  
};

ClientWall.prototype = Object.create(Wall.prototype);

// set the position from where to calculate the hidden area
ClientWall.prototype.setHidden = function (position) {
  Wall.prototype.setHidden.call(this, position);
  
  for (var i = 0; i < this.hidden.length; i++) {
    var ray1 = this.hidden[i].ray1;
    var ray2 = this.hidden[i].ray2;
    
    // calculate endpoints
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

// sets the visibility of the walls and the hidingblocks
ClientWall.prototype.setHidingblocksVisible = function (visible) {
  for (var i = 0; i < this.hidingBlocks.length; i++) {
    this.hidingBlocks[i].visible = visible;
  }
};

