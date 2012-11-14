// describes a player in the field

var Player = function (cfg) {
  // List of object where player can collide with
  this.collidableObjs = [];
  
  // Player speed
  this.speed = 10; // m/s
  
  // Current position
  this.position = cfg.position || new THREE.Vector2(0, 0);
  
  // Direction the player is moving to (normalized)
  this.walkDir = new THREE.Vector2(0, 0);
  
  // Direction the player is looking at (normalized)
  this.lookDir = new THREE.Vector2(0, 0);
  
  // Point the player is looking at
  this.target = new THREE.Vector2(0, 0);
  
  if (cfg.color === undefined) {
    cfg.color = 0xCC0000;
  }
  var material = new THREE.MeshPhongMaterial({ color: cfg.color });
  var shape = new THREE.Shape();
  shape.fromPoints([
    new THREE.Vector3(1, 0, 0), 
    new THREE.Vector3(-0.5, -0.5, 0),
    new THREE.Vector3(-0.5, 0.5, 0)
  ]);  
  this.mesh = new THREE.Mesh(shape.extrude({amount: 1, bevelEnabled: false}), material);
  
  this.mesh.position.set(this.position.x, this.position.y, 0.5);
  
};

// Update player state with a timeframe of delta
Player.prototype.update = function(delta) {
  this.updatePosition(delta);
  this.mesh.position.set(this.position.x, this.position.y, 0.5); 
  
  this.lookDir.copy(this.target)
              .subSelf(this.position)
              .normalize();
  
  var angle = Utils.angleBetweenVector2(new THREE.Vector2(1, 0), this.lookDir);  
  this.mesh.rotation.set(0, 0, angle);  
};

// Update player position with a timeframe of delta
Player.prototype.updatePosition = function (delta) {
  
  var nextPos = this.walkDir.clone()
                            .multiplyScalar(this.speed * delta)
                            .addSelf(this.position);

  // TODO(Jan): do 2D collision detection with new position/direction system
  // check the line between this.position and nextPos for intersections with geometry
  // then set this.position to nextPos or the intersection point
  // take bounding circle into account
  
  var oldX = this.position.x;
  var oldY = this.position.y;  
  
  this.mesh.position.set(nextPos.x, nextPos.y, 0.5);
  this.position.copy(nextPos);
  
  if(this.detectCollision(delta)) {
    this.mesh.position.set(oldX, oldY, 0.5);
    this.position.set(oldX, oldY);
  }
  
  // END TODO
};

Player.prototype.pushCollidable = function(obj) {
  this.collidableObjs.push(obj);
};

Player.prototype.detectCollision = function(delta) {
  // Loop all geometry vertices of the player mesh
  for (var vertexIndex = 0; vertexIndex < this.mesh.geometry.vertices.length; vertexIndex++) {       
    var localVertex = this.mesh.geometry.vertices[vertexIndex].clone();
    var globalVertex = this.mesh.matrix.multiplyVector3(localVertex);
    var directionVector = globalVertex.subSelf(this.mesh.position);

    // Create ray 
    var ray = new THREE.Ray(this.mesh.position, directionVector.clone().normalize());
    var collisionResults = ray.intersectObjects(this.collidableObjs);
    if (collisionResults.length > 0 && collisionResults[0].distance < this.speed * delta) {
        return true;
    }
  }

  return false;
};
