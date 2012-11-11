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
  return this.hidden;
};

// returns whether this wall hides the object at position
Wall.prototype.hides = function(position) {
  for (var i = 0; i < this.hidden.length; i++) {
    var ray1 = this.hidden[i].ray1;
    var ray2 = this.hidden[i].ray2;
    
    
    var pos1 = position.clone().subSelf(ray1.origin);
    var pos2 = position.clone().subSelf(ray2.origin);
    if (i === 4){
    console.log(pos1.dot(ray1.hiddenDir));
    }
    var hides1 = pos1.dot(ray1.wallDir) * pos1.dot(ray1.hiddenDir) > 0;
    var hides2 = pos2.dot(ray2.wallDir) * pos1.dot(ray2.hiddenDir) > 0;
    if (hides1 && hides2) return true;
  }
  return false;
};