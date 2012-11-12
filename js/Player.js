// describes a player in the field

var Player = function (cfg) {
  // List of object where player can collide with
  this.collidableObjs = [];
  
  // Init vars
  this.speed = 0.3;
  
  cfg.position = cfg.position || new THREE.Vector2(0, 0);
  if (cfg.color === undefined) {
    cfg.color = 0xCC0000;
  }
  var material = new THREE.MeshPhongMaterial({ color: cfg.color });
  this.mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5), material);
  this.mesh.position.set(cfg.position.x, cfg.position.y, 0.5);

};

Player.prototype.move = function(x, y) {
    this.mesh.translateX(x);
    this.mesh.translateY(y);

    if(this.detectCollision()) {
      this.mesh.translateX(-x);
      this.mesh.translateY(-y);
    }
};

Player.prototype.getPosition = function() {
  return new THREE.Vector2(this.mesh.position.x, this.mesh.position.y);
};

Player.prototype.getSpeed = function() {
  return this.speed;
}

Player.prototype.setSpeed = function(speed) {
  this.speed = speed;
}

Player.prototype.pushCollidable = function(obj) {
  this.collidableObjs.push(obj);
}

Player.prototype.detectCollision = function(x, y) {
  // Loop all geometry vertices of the player mesh
  for (var vertexIndex = 0; vertexIndex < this.mesh.geometry.vertices.length; vertexIndex++) {       
    var localVertex = this.mesh.geometry.vertices[vertexIndex].clone();
    var globalVertex = this.mesh.matrix.multiplyVector3(localVertex);
    var directionVector = globalVertex.subSelf(this.mesh.position);

    // Create ray 
    var ray = new THREE.Ray(this.mesh.position, directionVector.clone().normalize());
    var collisionResults = ray.intersectObjects(this.collidableObjs);
    if (collisionResults.length > 0 && collisionResults[0].distance < this.speed) {
        return true;
    }
  }

  return false;
}
