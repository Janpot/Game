// Describes a wall in the world, a wall is basically a 2D polygon in the XYplane
var Wall = function (cfg) {
  
  this.corners = cfg.corners;
  
  // create mesh
  var height = 3;  
  var lowerVertices = [];
  for (var i = 0; i < this.corners.length; i++) {
    lowerVertices.push(new THREE.Vector3(this.corners[i].x, this.corners[i].y, 0));
  }
  var shape = new THREE.Shape();
  shape.fromPoints(lowerVertices);  
  var material = new THREE.MeshPhongMaterial({ color: 0x00CC00 });
  this.mesh = new THREE.Mesh(shape.extrude({amount: height, bevelEnabled: false}), material);
  
  // each hidden area consists of 2 2D rays in the XY plane
  // initialize the objects up front for performance
  this.hidden = [];
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
    })
  }
  
  // debug
  var mat = new THREE.LineBasicMaterial({
    color: 0x0000ff,
  });
  this.hidingRays = [];
  for (var i = 0; i < this.corners.length; i++) {
    var geom = new THREE.Geometry();
    geom.vertices[0] = new THREE.Vector3(0, 0, 0);
    geom.vertices[1] = new THREE.Vector3(0, 0, 0);
    this.hidingRays.push(new THREE.Line(geom, mat));
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
    var length = 2000;
    this.hidingRays[i].geometry.vertices[0].set(ray1.origin.x, ray1.origin.y, 0);
    var end = ray1.hiddenDir.clone().multiplyScalar(length).addSelf(ray1.origin);
    this.hidingRays[i].geometry.vertices[1].set(end.x, end.y, 0);
    this.hidingRays[i].geometry.verticesNeedUpdate = true;
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
    var inside1 = Utils.isBetweenVectors(ray1.wallDir, ray1.hiddenDir, pos1);
    var inside2 = Utils.isBetweenVectors(ray2.wallDir, ray2.hiddenDir, pos2);
    if (inside1 && inside2) {
      return true;
    }
  }
  return false;
};