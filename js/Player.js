var game = game || {};

// describes a player in the field
game.Player = (function() {
  var Player = function (cfg) {
    // List of object where player can collide with
    this.collidableObjs = [];
    this.collidableObjs2 = [];
    
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
    
    // radius for a bounding circle for collision detection
    this.boundingRadius = 1;
    
    // bounding box for the player
    this.bounds = new THREE.Rectangle();
    
    
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
    
    var angle = game.Utils.angleBetweenVector2(new THREE.Vector2(1, 0), this.lookDir);  
    this.mesh.rotation.set(0, 0, angle);  
  };
  
  // Update player position with a timeframe of delta
  Player.prototype.updatePosition = function (delta) {
    
    var distance = this.walkDir.clone().multiplyScalar(this.speed * delta);
  
    // TODO(Jan): do 2D collision detection with new position/direction system
    // check the line between this.position and nextPos for intersections with geometry
    // then set this.position to nextPos or the intersection point
    // take bounding circle into account
    
    var movementBounds = new THREE.Rectangle();
    movementBounds.addPoint(this.position.x, this.position.y);
    movementBounds.addPoint(this.position.x + distance.x, this.position.y + distance.y);
    
    var wallPieceBounds = new THREE.Rectangle();
    
    var collision = false;
    if (distance.length() >= this.boundingRadius * 2) {
      // Do capsule collision detection
      
    } else {
      for (var i = 0; i < this.collidableObjs.length; i++) {      
        var wall = this.collidableObjs[i];
        
        if (!wall.bounds.intersects(movementBounds)) {
          // early out
          continue;
        }
        
        var objCount = wall.corners.length;
        for (var j = 0; j < objCount; j++) {
          var p1 = wall.corners[j];
          var p2 = wall.corners[(j + 1) % objCount];
          
          wallPieceBounds.empty();
          wallPieceBounds.addPoint(p1.x, p1.y);
          wallPieceBounds.addPoint(p2.x, p2.y);
          
          if (!wallPieceBounds.intersects(movementBounds)) {
            // early out
            continue;
          }
          
          var u = new THREE.Vector2().sub(p2, p1);
          var v = distance;
          var w = new THREE.Vector2().sub(p1, this.position);
              
          var s = (v.y * w.x - v.x * w.y) / (v.x * u.y - v.y * u.x);
          var t = (u.x * w.y - u.y * w.x) / (u.x * v.y - u.y * v.x);
          if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            collision = true;
          }
        }
      }
    }
    
    if(!collision) {    
      this.position.addSelf(distance);    
    }
    
    this.mesh.position.set(this.position.x, this.position.y, 0.5);
    
    // END TODO
  };
  
  Player.prototype.pushCollidable = function(wall) {
    this.collidableObjs.push(wall);
  };
  
  Player.prototype.updateBounds = function () {
    this.bounds.empty();
    this.bounds.addPoint(this.position.x - this.boundingRadius, this.position.y - this.boundingRadius);  
    this.bounds.addPoint(this.position.x + this.boundingRadius, this.position.y + this.boundingRadius);
  };
  
  return Player;
  
})();